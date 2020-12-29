import {
    State,
    Subscriptions,
    StateValueArray,
    StateValueObject,
    isObjectSubscriptions
} from "./types";
import fromEntries from 'object.fromentries';

function generateArrayState(
    json: Array<unknown>,
    subscriptions: Subscriptions
): StateValueArray {
    const result: StateValueArray = {
        type: 'array',
        length: json.length,
    };

    if (isObjectSubscriptions(subscriptions)) {
        result.values = json.map((value, index) => generateState(
            value,
            subscriptions?.[index] || null,
        ));
    }

    return result;
}

function generateObjectState(
    json: Record<string, unknown>,
    subscriptions: Subscriptions
): StateValueObject {
    const keys = Object.keys(json);

    const result: StateValueObject = {
        type: 'object',
        numKeys: keys.length,
    };

    if (isObjectSubscriptions(subscriptions)) {
        result.values = fromEntries(
            keys.map(key => {
                return [key, generateState(json[key], subscriptions?.[key] || null)]
            })
        );
    }

    return result;
}

export function generateState(
    json: unknown,
    subscriptions: Subscriptions
): State {
    switch(typeof json) {
        case "boolean":
        case "string":
        case "number": {
            return json;
        }
        case "undefined": {
            return { type: 'undefined' }
        }
        case "function": {
            let code = json.toString().replace(/\s+/g, ' ');
            if (code.length > 18) {
                code = `${code.substring(0, 15)}...`;
            }
            return {
                type: 'function',
                code,
            }
        }
        case "object": {
            if (json === null) {
                return json;
            }
            if (Array.isArray(json)) {
                return generateArrayState(json, subscriptions);
            }
            return generateObjectState(json as Record<string, unknown>, subscriptions);
        }
        default: {
            return { type: 'unknown' };
        }
    }
}

export function stateIsEqual(a: State, b: State): boolean {
    const typeofA = typeof a;

    if (typeofA !== typeof b) {
        return false;
    }

    switch (typeofA) {
        case "object": {
            if (a === null) {
                return b === null;
            }
            if (Array.isArray(a)) {
                return Array.isArray(b) && a.every((val, index) => stateIsEqual(val, b[index]));
            }

            return !Array.isArray(b) && Object.keys(a).every(key => stateIsEqual((a as any)[key], (b as any)[key]));
        }
        default:
            return a === b;
    }
}
