import React, {useMemo} from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import type {State, Subscriptions, ObjectSubscriptions} from "../lib/types";
import DataTree from "./DataTree";
import TreeContext, {TreeContextValue} from "./TreeContext";
import {ContentWrapper} from "./uiComponents";
import {Alert} from "antd";

type PersistentData = {
    subscriptions: Subscriptions
};

type LocalState = {
    data: State;
    ready: boolean;
}

type Events = {
    state: State;
    init: { hello: string };
};

type Methods = {
    setSubscriptions(newSubscriptions: Subscriptions): Promise<{ ack: true }>,
}

export function plugin(client: PluginClient<Events, Methods>) {
    const persistentData = createState<PersistentData>({
        subscriptions: {}
    }, {persist: `data_${client.appId}`});
    const localState = createState<LocalState>({
        data: null,
        ready: false,
    });

    client.onConnect(() => {
        client.onMessage('state', newState => {
            localState.update(draft => {
                draft.data = newState;
            });
        });
        client.onMessage('init', () => {
            localState.update(draft => {
                draft.ready = true;
            });
            client.send('setSubscriptions', persistentData.get().subscriptions);
        });
    });

    client.onDisconnect(() => {
        localState.update(draft => {
            draft.ready = false;
        });
    });

    client.onActivate(() => {
        if (localState.get().ready) {
            client.send('setSubscriptions', persistentData.get().subscriptions);
        }
    });

    return {
        localState,
        subscribe(path: string) {
            const segments = path.replace(/^\./, '').split('.');
            persistentData.update(draft => {
                let current: ObjectSubscriptions = draft.subscriptions || {};

                segments.forEach(segment => {
                    current[segment] = current[segment] || {};
                    current = current[segment] as ObjectSubscriptions;
                });
            });

            if (localState.get().ready) {
                client.send('setSubscriptions', persistentData.get().subscriptions);
            }
        },
        unsubscribe(path: string) {
            const segments = path.replace(/^\./, '').split('.');
            persistentData.update(draft => {
                let current: ObjectSubscriptions = draft.subscriptions || {};

                const finalSegment = segments.pop();
                if (!finalSegment) {
                    draft.subscriptions = null;
                    return;
                }

                for (const segment of segments) {
                    if (!current[segment]) {
                        return;
                    }
                    current = current[segment] as ObjectSubscriptions;
                }
                if (current) {
                    delete current[finalSegment];
                }
            });
            if (localState.get().ready) {
                client.send('setSubscriptions', persistentData.get().subscriptions);
            }
        }
    };
}

export function Component() {
    const instance = usePlugin(plugin);
    const { data, ready } = useValue(instance.localState);

    const contextValue = useMemo<TreeContextValue>(
        () => ({subscribe: instance.subscribe, unsubscribe: instance.unsubscribe}),
        [instance.subscribe, instance.unsubscribe]
    );

    return (
        <TreeContext.Provider value={contextValue}>
            <Layout.ScrollContainer vertical>
                <ContentWrapper>

                    {
                        ready && !data && (
                            <Alert message="Waiting for app to send state" type="info" />
                        )
                    }
                    {
                        !ready && !data && (
                            <Alert message="Waiting for app to connect to plugin" type="info" />
                        )
                    }
                    { data && <DataTree state={data} name="data" isRoot /> }
                </ContentWrapper>
            </Layout.ScrollContainer>
        </TreeContext.Provider>
    );
}
