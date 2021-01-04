import {Subscriptions, State, StateSegment} from "../lib/types";

export type RuntimeOptions = {
    showHidden: boolean;
    showLabels: boolean;
}

export type PersistentData = RuntimeOptions & {
    subscriptions: Subscriptions;
};

export type LocalState = {
    data: State;
    ready: boolean;
}

export type Events = {
    updateSegment: { path: string, segment: StateSegment };
    init: { hello: string };
};

export type Methods = {
    setSubscriptions(newSubscriptions: { subscriptions: Subscriptions }): Promise<{ ack: true }>,
}
