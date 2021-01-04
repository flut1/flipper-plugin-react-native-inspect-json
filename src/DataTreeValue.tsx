import React, {FunctionComponent, useState, useRef, useEffect} from "react";
import {StateValue} from "../lib/types";
import {TreeRow, SubTree, Type, Value, Name, ObjectIndicator} from "./uiComponents";

interface Props {
    value: StateValue;
    name: string;
    isExpanded: boolean;
    onClick?: () => void;
}

const SHORT_TYPES = {
    boolean: 'bool',
    string: 'string',
    function: 'func',
    number: 'num'
}

const DataTreeValue: FunctionComponent<Props> = ({ value, name, isExpanded, onClick, children }) => {
    const [hasExpanded, setHasExpanded] = useState(false);
    const initialExpanded = useRef(isExpanded);

    useEffect(() => {
        if (isExpanded && !initialExpanded.current) {
            setHasExpanded(true);
        }
    }, [isExpanded]);

    switch (value.type) {
        case "function":
            return (
                <TreeRow isExpanded={isExpanded}>
                    <Type>{SHORT_TYPES.function}</Type>
                    { name && <Name>{name}</Name> }
                    <Value type={value.type}>{value.code}</Value>
                </TreeRow>
            );
        case "null":
            return (
                <TreeRow isExpanded={isExpanded}>
                    { name && <Name>{name}</Name> }
                    <Value type={value.type}>null</Value>
                </TreeRow>
            );
        case "undefined":
            return (
                <TreeRow isExpanded={isExpanded}>
                    { name && <Name>{name}</Name> }
                    <Value type="undefined">undefined</Value>
                </TreeRow>
            );
        case "number":
        case "string":
        case "boolean":
            return (
                <TreeRow isExpanded={isExpanded}>
                    <Type>{ SHORT_TYPES[value.type] }</Type>
                    { name && <Name>{name}</Name> }
                    <Value type={value.type}>{ JSON.stringify(value.value) }</Value>
                </TreeRow>
            );
        case "array":
            return (
                <>
                    <TreeRow isExpanded={isExpanded} onClick={onClick}>
                        <Type>
                            <ObjectIndicator characters="[]">{value.length}</ObjectIndicator>
                        </Type>
                        {name && <Name>{name}</Name>}
                    </TreeRow>

                    { isExpanded && (
                        <SubTree hasAppeared={hasExpanded}>
                            {children}
                        </SubTree>
                    )}
                </>
            );
        case "object":
            return (
                <>
                    <TreeRow isExpanded={isExpanded} onClick={onClick}>
                        <Type>
                            <ObjectIndicator characters="{}">{value.numKeys}</ObjectIndicator>
                        </Type>
                        {name && <Name>{name}</Name>}
                    </TreeRow>

                    { isExpanded && (
                        <SubTree hasAppeared={hasExpanded}>
                            {children}
                        </SubTree>
                    )}
                </>
            );
        default:
            return null;
    }
};

export default DataTreeValue;
