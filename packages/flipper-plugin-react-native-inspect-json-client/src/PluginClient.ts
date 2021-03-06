import {Flipper, addPlugin} from "react-native-flipper";
import debounce from "lodash.debounce";
import {Subscriptions, StateSegment, Subscription, Options} from "./types";
import {generateStateSegment, generateStateValue, getAtPath} from "./state";

const SEND_SEGMENT_DEBOUNCE = 500;
const SEND_SEGMENT_MAX_WAIT = 1000;

type OnSubscriptionsUpdateCallback = (subscriptions: Subscriptions) => any;
type OnConnectCallback = (subscriptions: Subscriptions | null) => any;
type OnDisconnectCallback = () => any;

export default class PluginClient {
    private debouncedSend: Record<Subscription, (newValue: StateSegment | null) => void> = {};
    private $subscriptions: Subscriptions | null = null;
    private options: Options;
    private connection: Flipper.FlipperConnection | null = null;

    public onConnect: OnConnectCallback = () => {};
    public onDisconnect: OnDisconnectCallback = () => {};
    public onSubscriptionsUpdate: OnSubscriptionsUpdateCallback = () => {};

    constructor(options: Partial<Options>) {
        this.options = {
            includeMethods: false,
            includeNonEnumerableKeys: false,
            ...options,
        }

        const client = this;
        addPlugin({
            getId() {
                return 'react-native-inspect-json';
            },
            onConnect(newConnection: Flipper.FlipperConnection) {
                client.connection = newConnection;

                newConnection.receive('setSubscriptions', ({ subscriptions }, responder) => {
                    client.$subscriptions = subscriptions;
                    client.onSubscriptionsUpdate && client.onSubscriptionsUpdate(subscriptions);

                    responder.success({
                        ack: true
                    });
                });

                client.onConnect && client.onConnect(client.subscriptions);
                client.send('init', { hello: 'world'});
            },
            onDisconnect() {
                client.connection = null;
                client.onDisconnect && client.onDisconnect();
            },
            runInBackground() {
                return false;
            },
        });
    }

    public generateStateSegment(json: unknown) {
        return generateStateSegment(json, this.options);
    }

    public generateStateValue(json: unknown) {
        return generateStateValue(json, this.options);
    }

    public getAtPath(input: unknown, path: string) {
        return getAtPath(input, path);
    }

    public get subscriptions() {
        return this.$subscriptions;
    }

    public updateSegment(subscription: Subscription, segment: StateSegment | null, immediate = false) {
        if (immediate) {
            return this.sendSegment(subscription, segment);
        }

        if (!this.debouncedSend[subscription]) {
            this.debouncedSend[subscription] = debounce(
                (newValue: StateSegment | null) => this.sendSegment(subscription, newValue),
                SEND_SEGMENT_DEBOUNCE,
                { maxWait: SEND_SEGMENT_MAX_WAIT }
            );
        }
        this.debouncedSend[subscription]!(segment);
    }

    private send(method: string, data: any) {
        if (this.connection) {
            this.connection.send(method, data);
        }
    }

    private sendSegment(subscription: Subscription, segment: StateSegment | null) {
        this.send('updateSegment', { path: subscription, segment });
    }
}
