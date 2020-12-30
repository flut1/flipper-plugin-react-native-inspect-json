import React, {FunctionComponent, useState, useEffect, useRef, useMemo} from 'react';
import {styled} from 'flipper-plugin';
import {State} from "../lib/types";
import {TreeRow, SubTree, ObjectIndicator, Value, Type} from "./uiComponents";

interface Props {
    state: State;
    name?: string;
    path?: string;
    isRoot?: boolean;
}

const NameWrapper = styled.div({
    flex: '0 0 auto',
    paddingTop: 5,
    paddingBottom: 5,
});

const Name: FunctionComponent = ({ children }) => (
    <NameWrapper>
        {children}
    </NameWrapper>
);

const SHORT_TYPES = {
    boolean: 'bool',
    string: 'string',
    function: 'func',
    number: 'num'
}

const DataTree: FunctionComponent<Props> = ({ state, name, path = '', isRoot }) => {
    const [hasExpanded, setHasExpanded] = useState(false);

    const childValues = useMemo(() => {
        if (typeof state !== 'object' || state === null || !('values' in state) || !state.values) {
            return null;
        }

        if (state.type === 'array') {
            return state.values.map((value, index) => ({
                state: value,
                key: index,
                name: `[${index}]`,
                path: `${path}.${index}`,
            })) as Array<Required<Props> & { key: any }>;
        }

        const props = Object.entries(state.values)
            .map(([key, value]) => ({
                state: value,
                key,
                name: key,
                path: `${path}.${key}`,
            })) as Array<Required<Props> & { key: any }>;

        props.sort((a, b) => {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });

        return props;
    }, [state]);

    const initialExpanded = useRef(!!childValues);

    useEffect(() => {
        if (!!childValues && !initialExpanded.current) {
            setHasExpanded(true);
        }
    }, [state]);

    if (typeof state !== 'object' || state === null) {
        return (
            <TreeRow isRoot={isRoot}>
                <Type>{ (SHORT_TYPES as any)[typeof state] }</Type>
                { name && <Name>{name}</Name> }
                <Value>{ state }</Value>
            </TreeRow>
        );
    }

    switch (state.type) {
        case "array":
        case "object":
            return (
                <>
                    <TreeRow isExpanded={!!childValues} path={path} isRoot={isRoot}>
                        <Type>
                            { state.type === "array" && <ObjectIndicator characters="[]">{state.length}</ObjectIndicator> }
                            { state.type === "object" && <ObjectIndicator characters="{}">{state.numKeys}</ObjectIndicator> }
                        </Type>
                        {name && <Name>{name}</Name>}
                    </TreeRow>
                    {
                        childValues && (
                            <SubTree isRoot={isRoot} hasExpanded={hasExpanded}>
                                {childValues.map(props => <DataTree {...props} />)}
                                {
                                    !childValues.length && (
                                        <TreeRow>
                                            <Type>(empty array)</Type>
                                        </TreeRow>
                                    )
                                }
                            </SubTree>
                        )
                    }
                </>
            );
        case "function":
            // todo: create option to show functions
            // return (
            //     <TreeRow isRoot={isRoot}>
            //         <Type>{SHORT_TYPES.function}</Type>
            //         { name && <Name>{name}</Name> }
            //         <Value>{state.code}</Value>
            //     </TreeRow>
            // );
        case "unknown":
        default:
            return null;
    }
}

export default DataTree;
