import React, {FunctionComponent, useMemo, Fragment} from 'react';
import {usePlugin, useValue} from "flipper-plugin";
import type {State, Subscriptions} from "flipper-plugin-react-native-inspect-json-client";
import {TreeRow, Type} from "./uiComponents";
import DataTreeValue from "./DataTreeValue";
import plugin from './plugin';

interface Props {
    state: State;
    path?: string;
    subscriptions: Subscriptions;
}

const DataTree: FunctionComponent<Props> = ({ state, path = '', subscriptions }) => {
    const { subscribe, unsubscribe, persistentData } = usePlugin(plugin);
    const { showHidden } = useValue(persistentData);
    const stateAtPath = state[path];

    const entries = useMemo(() => {
        if (!stateAtPath) {
            return null;
        }

        if (stateAtPath.type === 'array') {
            return stateAtPath.values.map((value, index) => ({
                name: `[${index}]`,
                path: `${path === '.' ? '' : path}[${index}]`,
                value,
            }));
        }

        const props = Object.entries(stateAtPath.values).map(([key, value]) => ({
            name: key,
            path: path === '.' ? key : `${path}.${key}`,
            value,
        }));
        props.sort((a, b) => {
            return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
        });
        return props;
    }, [stateAtPath]);

    if (!entries) {
        return (
            <TreeRow>
                <Type>waiting for device to send...</Type>
            </TreeRow>
        )
    }

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

                if (!showHidden && entry.value.hide) {
                    return null;
                }

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
