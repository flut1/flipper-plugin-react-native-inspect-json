import React, {useMemo} from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import type {State, Subscriptions, StateSegment} from "../lib/types";
import DataTree from "./DataTree";
import {ContentWrapper, TreeRow, Name, SubTree} from "./uiComponents";
import {Alert} from "antd";

type PersistentData = {
    subscriptions: Subscriptions
};

type LocalState = {
    data: State;
    ready: boolean;
}

type Events = {
    updateSegment: { path: string, segment: StateSegment };
    init: { hello: string };
};

type Methods = {
    setSubscriptions(newSubscriptions: { subscriptions: Subscriptions }): Promise<{ ack: true }>,
}

export function plugin(client: PluginClient<Events, Methods>) {
    const persistentData = createState<PersistentData>({
        subscriptions: ['.']
    }, {persist: `data_${client.appId}`});
    const localState = createState<LocalState>({
        data: {},
        ready: false,
    });

    client.onConnect(() => {
        client.onMessage('updateSegment', ({ path, segment }) => {
            localState.update(draft => {
                draft.data[path] = segment;
            });
        });
        client.onMessage('init', () => {
            localState.update(draft => {
                draft.ready = true;
            });
            client.send('setSubscriptions', persistentData.get());
        });
    });

    client.onDisconnect(() => {
        localState.update(draft => {
            draft.ready = false;
        });
    });

    client.onActivate(() => {
        if (localState.get().ready) {
            client.send('setSubscriptions', persistentData.get());
        }
    });

    return {
        localState,
        persistentData,
        subscribe(path: string) {
            persistentData.update(draft => {
                if (!draft.subscriptions.includes(path)) {
                    draft.subscriptions.push(path);
                }
            });

            if (localState.get().ready) {
                client.send('setSubscriptions', persistentData.get());
            }
        },
        unsubscribe(path: string) {
            persistentData.update(draft => {
                for (let i=draft.subscriptions.length - 1; i >= 0; i--) {
                    if (draft.subscriptions[i].startsWith(path)) {
                        draft.subscriptions.splice(i, 1);
                    }
                }
            });
            if (localState.get().ready) {
                client.send('setSubscriptions', persistentData.get());
            }
        }
    };
}

export function Component() {
    const instance = usePlugin(plugin);
    const { data, ready } = useValue(instance.localState);
    const { subscriptions } = useValue(instance.persistentData);

    return (
        <Layout.ScrollContainer vertical>
            <ContentWrapper>
                {
                    ready && !data['.'] && (
                        <Alert message="Waiting for app to send state" type="info" />
                    )
                }
                {
                    !ready && (
                        <Alert message="Waiting for app to connect to plugin" type="info" />
                    )
                }
                { data['.'] && (
                    <>
                        <TreeRow isRoot isExpanded>
                            <Name>data</Name>
                        </TreeRow>
                        <SubTree isRoot>
                            <DataTree
                                state={data}
                                subscriptions={subscriptions}
                                path="."
                                subscribe={instance.subscribe}
                                unsubscribe={instance.unsubscribe}
                            />
                        </SubTree>
                    </>
                ) }
            </ContentWrapper>
        </Layout.ScrollContainer>
    );
}
