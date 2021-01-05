import React from 'react';
import {usePlugin, createState, useValue, Layout, PluginClient} from 'flipper-plugin';
import DataTree from "./DataTree";
import {ContentWrapper, TreeRow, Name, SubTree, ResetButton} from "./uiComponents";
import {Alert, Checkbox} from "antd";
import {PersistentData, LocalState, Events, Methods, RuntimeOptions} from "./desktopTypes";
import Toolbar from "./ToolBar";

export function plugin(client: PluginClient<Events, Methods>) {
    const persistentData = createState<PersistentData>({
        subscriptions: ['.'],
        showHidden: false,
        hiddenLabels: [],
        labels: [],
    }, {persist: `data_${client.appId}`});
    const localState = createState<LocalState>({
        data: {},
        ready: false,
    });

    const sendSubscriptions = () => client.send(
        'setSubscriptions',
        { subscriptions: persistentData.get().subscriptions }
    );

    client.onConnect(() => {
        client.onMessage('updateSegment', ({ path, segment }) => {
            localState.update(draft => {
                draft.data[path] = segment;
            });

            const values = segment.type === 'array' ? segment.values : Object.values(segment.values);
            const labels = new Set<string>();
            for (const value of values) {
                if (value.labels) {
                    for (const label of value.labels) {
                        labels.add(label);
                    }
                }
            }
            persistentData.update(draft => {
                for (const label of labels.values()) {
                    if (!draft.labels.includes(label)) {
                        draft.labels.push(label);
                    }
                }
            });
        });
        client.onMessage('init', () => {
            localState.update(draft => {
                draft.ready = true;
            });
            sendSubscriptions();
        });
    });

    client.onDisconnect(() => {
        localState.update(draft => {
            draft.ready = false;
        });
    });

    client.onActivate(() => {
        if (localState.get().ready) {
            sendSubscriptions();
        }
    });

    return {
        localState,
        persistentData,
        toggleOption(option: 'showHidden') {
            persistentData.update(draft => {
                draft[option] = !draft[option];
            });
        },
        setVisibleLabels(labels: Array<string>) {
            persistentData.update(draft => {
                draft.hiddenLabels = draft.labels.filter(label => !labels.includes(label));
            });
        },
        reset() {
            localState.update(draft => {
                draft.data = {};
            });
            persistentData.update(draft => {
                draft.subscriptions = ['.'];
                draft.labels = [];
            });
            sendSubscriptions();
        },
        subscribe(path: string) {
            persistentData.update(draft => {
                if (!draft.subscriptions.includes(path)) {
                    draft.subscriptions.push(path);
                }
            });

            if (localState.get().ready) {
                sendSubscriptions();
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
            localState.update(draft => {
               for (const key of Object.keys(draft.data)) {
                  if (key.startsWith(path)) {
                      delete draft.data[key as keyof typeof draft];
                  }
               }
            });
            if (localState.get().ready) {
                sendSubscriptions();
            }
        }
    };
}

export function Component() {
    const instance = usePlugin(plugin);
    const { data, ready } = useValue(instance.localState);
    const { subscriptions } = useValue(instance.persistentData);

    return (
        <Layout.Top>
            <Toolbar />
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
                                />
                            </SubTree>
                        </>
                    ) }
                </ContentWrapper>
            </Layout.ScrollContainer>
        </Layout.Top>
    );
}
