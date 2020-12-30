import {Flipper, addPlugin} from 'react-native-flipper';
import {
    State,
    Subscriptions,
    PluginInstance
} from "./types";
import {stateIsEqual} from "./state";

export default function bootstrap(): PluginInstance {
    let connection: Flipper.FlipperConnection | null = null;
    let lastSentState: State | null = null;
    let queuedState: State | null = null;
    let subscriptions: Subscriptions = null;

    const instance: PluginInstance = {
        get subscriptions() {
            return subscriptions;
        },
        updateState: (newState: State) => {
            if (!connection) {
                queuedState = newState;
                return;
            }

            queuedState = null;

            if (lastSentState) {
                if (stateIsEqual(lastSentState, newState)) {
                    console.log('redundant state update');
                    return;
                }
            }
            lastSentState = newState;
            connection.send('state', newState);
        },
        onConnect: null,
        onDisconnect: null,
        onSetSubscriptions: null,
    }

    addPlugin({
        getId() {
            return 'react-native-inspect-json';
        },
        onConnect(newConnection: Flipper.FlipperConnection) {
            connection = newConnection;

            connection.receive('setSubscriptions', (params, responder) => {
                subscriptions = params;
                instance.onSetSubscriptions && instance.onSetSubscriptions(params);

                responder.success({
                    ack: true
                });
            });

            if (queuedState) {
                instance.updateState(queuedState);
            }

            instance.onConnect && instance.onConnect(subscriptions);
            connection.send('init', { hello: 'world'});
        },
        onDisconnect() {
            connection = null;
            instance.onDisconnect && instance.onDisconnect();
        },
        runInBackground() {
            return false;
        },
    });

    return instance;
}
