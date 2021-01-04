import React, {FunctionComponent, useMemo, Fragment} from 'react';
import {State, Subscriptions, StateValue} from "../lib/types";
import {TreeRow, Type} from "./uiComponents";
import DataTreeValue from "./DataTreeValue";

interface Props {
    state: State;
    path?: string;
    subscriptions: Subscriptions;
    subscribe: (path: string) => void;
    unsubscribe: (path: string) => void;
}

const DataTree: FunctionComponent<Props> = ({ state, path = '', subscriptions, subscribe, unsubscribe }) => {
    const stateAtPath = state[path];

    if (!stateAtPath) {
        return (
            <TreeRow>
                <Type>waiting for device to send...</Type>
            </TreeRow>
        )
    }

    const entries = useMemo(() => {
        if (stateAtPath.type === 'array') {
            return stateAtPath.values.map((value, index) => ({
                name: `[${index}]`,
                path: `${path === '.' ? '' : path}[${index}]`,
                value,
            }));
        }

        return Object.entries(stateAtPath.values).map(([key, value]) => ({
            name: key,
            path: path === '.' ? key : `${path}.${key}`,
            value,
        }));
    }, [stateAtPath]);

    if (!entries.length) {
        return (
            <TreeRow>
                <Type>(empty)</Type>
            </TreeRow>
        )
    }

    return (
        <>
            {entries.map((entry) => {
                const isExpanded = subscriptions.includes(entry.path);
                const onClick = isExpanded ? () => unsubscribe(entry.path) : () => subscribe(entry.path);

                return (
                    <Fragment key={entry.path}>
                        <DataTreeValue
                            value={entry.value}
                            name={entry.name}
                            isExpanded={isExpanded}
                            onClick={onClick}
                        >
                            { ['object', 'array'].includes(entry.value.type) && (
                                <DataTree
                                    unsubscribe={unsubscribe}
                                    subscribe={subscribe}
                                    state={state}
                                    subscriptions={subscriptions}
                                    path={entry.path}
                                />
                            )}
                        </DataTreeValue>
                    </Fragment>
                );
            })}
        </>
    );
}

export default DataTree;
