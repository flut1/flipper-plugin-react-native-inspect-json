import React, {FunctionComponent, useState, useEffect, useRef} from 'react';
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
    const initialExpanded = useRef(typeof state === 'object' && state !== null && 'values' in state);

    useEffect(() => {
        if (typeof state === 'object' && state !== null && 'values' in state && !initialExpanded.current) {
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
            return (
                <>
                    <TreeRow isExpanded={'values' in state} path={path} isRoot={isRoot}>
                        <Type>
                            <ObjectIndicator characters="[]">{state.length}</ObjectIndicator>
                        </Type>
                        { name && <Name>{name}</Name> }
                    </TreeRow>
                    {
                        state.values && (
                            <SubTree isRoot={isRoot} hasExpanded={hasExpanded}>
                                {
                                    state.values.map((value, index) => (
                                        <DataTree
                                            state={value}
                                            key={index}
                                            name={`[${index}]`}
                                            path={`${path}.${index}`}
                                        />
                                    ))
                                }
                                {
                                    !state.values.length && (
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
        case "object":
            return (
                <>
                    <TreeRow isExpanded={'values' in state} path={path} isRoot={isRoot}>
                        <Type>
                            <ObjectIndicator characters="{}">{state.numKeys}</ObjectIndicator>
                        </Type>
                        { name && <Name>{name}</Name> }
                    </TreeRow>
                    {
                        state.values && (
                            <SubTree isRoot={isRoot} hasExpanded={hasExpanded}>
                                {
                                    Object.entries(state.values).map(([key, value]) => (
                                        <DataTree
                                            state={value}
                                            key={key}
                                            name={key}
                                            path={`${path}.${key}`}
                                        />
                                    ))
                                }
                                {
                                    !Object.entries(state.values).length && (
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
            return (
                <TreeRow isRoot={isRoot}>
                    <Type>{SHORT_TYPES.function}</Type>
                    { name && <Name>{name}</Name> }
                    <Value>{state.code}</Value>
                </TreeRow>
            );
        case "unknown":
        default:
            return null;
    }
}

export default DataTree;
