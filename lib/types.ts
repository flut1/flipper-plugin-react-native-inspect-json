export type Subscription = string;
export type Subscriptions = Array<Subscription>;

export type Options = {
    includeMethods: boolean;
    includeNonEnumerableKeys: boolean;
}

export type StateValueArray = {
    type: 'array';
    length: number;
}

export type StateValueFunction = {
    type: 'function';
    code: string;
}

export type StateValueUndefined = {
    type: 'undefined';
}

export type StateValueNull = {
    type: 'null';
}

export type StateValueString = {
    type: 'string';
    value: string;
}

export type StateValueNumber = {
    type: 'number';
    value: number;
}

export type StateValueBoolean = {
    type: 'boolean';
    value: boolean;
}

export type StateValueObject = {
    type: 'object';
    numKeys: number;
}

export type StateValue =
    | StateValueArray
    | StateValueBoolean
    | StateValueFunction
    | StateValueNull
    | StateValueNumber
    | StateValueObject
    | StateValueString
    | StateValueUndefined;

export type StateSegmentArray = {
    type: 'array';
    values: Array<StateValue>;
}

export type StateSegmentObject = {
    type: 'object';
    values: { [key: string]: StateValue };
}

export type StateSegment =
    | StateSegmentArray
    | StateSegmentObject;

export type State = Record<Subscription, StateSegment>;
