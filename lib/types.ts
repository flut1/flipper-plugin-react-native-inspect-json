
export type NoSubscriptions = null;
export type ObjectSubscriptions = { [name: string]: Subscriptions };

export type Subscriptions = NoSubscriptions | ObjectSubscriptions;

export function isObjectSubscriptions(subscriptions:Subscriptions): subscriptions is ObjectSubscriptions {
    return typeof subscriptions === 'object' && subscriptions !== null;
}

export type StateValuePrimitive = number | string | boolean | null;

export type StateValueArray = {
    type: 'array';
    length: number;
    values?: Array<State>;
}

export type StateValueFunction = {
    type: 'function';
    code: string;
}

/*
 * This is used if `typeof` returns something that we don't recognize
 */
export type StateValueUnknown = {
    type: 'unknown';
}

export type StateValueUndefined = {
    type: 'undefined';
}

export type StateValueObject = {
    type: 'object';
    numKeys: number;
    values?: Record<string, State>;
}

export type State =
    | StateValueArray
    | StateValueObject
    | StateValuePrimitive
    | StateValueFunction
    | StateValueUndefined
    | StateValueUnknown;

// export type StateWithSubscriptions = {
//     [K in keyof State]: State[K] extends StateValueArray | StateValueObject ?
//         State[K] & { subscribed: boolean } : State[K];
// }

export type PluginInstance = {
    readonly subscriptions: Subscriptions;
    updateState(newState: State): void;
    onSetSubscriptions: null | ((subscriptions: Subscriptions) => any);
    onConnect: null | ((subscriptions: Subscriptions) => any);
    onDisconnect: null | (() => any);
}
