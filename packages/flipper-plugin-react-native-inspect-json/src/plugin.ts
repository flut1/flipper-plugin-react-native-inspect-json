import {PluginClient, createState} from "flipper-plugin";
import {Events, Methods, PersistentData, LocalState} from "./desktopTypes";

export default function plugin(client: PluginClient<Events, Methods>) {
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
            if (!segment) {
                localState.update(draft => {
                    delete draft.data[path];
                });

                persistentData.update(draft => {
                    const subscriptionIndex = draft.subscriptions.indexOf(path);
                    if (subscriptionIndex >= 0) {
                        draft.subscriptions.splice(subscriptionIndex, 1);
                    }
                });

                return;
            }

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
