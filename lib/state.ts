import {
    StateValue,
    StateSegment,
    Options,
    StateSegmentArray,
    StateSegmentObject,
    ProcessPropertyResult
} from "./types";
import fromEntries from "object.fromentries";
import get from 'lodash.get';

export function getKeys(object: Record<keyof any, any>, options: Options) {
    return options.includeNonEnumerableKeys ? Object.getOwnPropertyNames(object) : Object.keys(object);
}

export function generateStateValue(json: unknown, options: Options): StateValue | undefined {
    switch(typeof json) {
        case "boolean":
        case "string":
        case "number": {
            return { type: typeof json, value: json } as any;
        }
        case "undefined": {
            return { type: 'undefined' }
        }
        case "function": {
            if(!options.includeMethods) {
                return;
            }
            let code = json.toString().replace(/\s+/g, ' ');
            if (code.length > 18) {
                code = `${code.substring(0, 60)}...`;
            }
            return {
                type: 'function',
                code,
            }
        }
        case "object": {
            if (json === null) {
                return { type: 'null' };
            }
            if (Array.isArray(json)) {
                return { type: 'array', length: json.length };
            }
            return { type: 'object', numKeys: getKeys(json, options).length };
        }
        default: {
            return;
        }
    }
}

export function generateStateSegment(json: unknown, options: Options): StateSegment | null {
    if (typeof json !== 'object' || json === null) {
        return null;
    }

    if (Array.isArray(json)) {
        return {
            type: 'array',
            values: json.map(value => generateStateValue(value, options)),
        } as StateSegmentArray;
    }

    return {
        type: 'object',
        values: fromEntries(
            getKeys(json, options)
                .map((key) => {
                    let preprocess: ProcessPropertyResult;

                    if (options.processProperty) {
                        preprocess = options.processProperty(json, key);
                    }

                    if (preprocess === false) {
                        return null;
                    }

                    const stateValue = generateStateValue((json as any)[key], options);

                    if (!stateValue) {
                        return null;
                    }

                    if (typeof preprocess === 'object') {
                        Object.assign(stateValue, preprocess);
                    }

                    return [key, stateValue];
                })
                .filter(_ => _) as Array<[string, StateValue]>
        ),
    } as StateSegmentObject;
}

/**
 * Gets the value inside an object at the specified path. A single dot ('.') as path will
 * return the object itself.
 *
 * @param input The object to look through
 * @param path The path to get, for example ".entities.users[4].name.first"
 */
export function getAtPath(input: unknown, path: string) {
    if (path === '.') return input;
    return get(input, path);
}
