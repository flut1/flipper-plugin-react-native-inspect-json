import React, {FunctionComponent, useState, useRef, useEffect} from "react";
import {usePlugin, useValue} from "flipper-plugin";
import {message} from "antd";
import type {StateValue} from "flipper-plugin-react-native-inspect-json-client";
import {TreeRow, SubTree, Type, Value, Name, Label} from "./uiComponents";
import plugin from './plugin';

interface Props {
    value: StateValue;
    name: string;
    isExpanded: boolean;
    onClick?: () => void;
}

const Labels: FunctionComponent<{ value: StateValue }> = ({
  value: { labels = [] }
}) => {
    const { persistentData } = usePlugin(plugin);
    const { hiddenLabels } = useValue(persistentData);

    return (
        <>
            {
                labels.filter(label => !hiddenLabels.includes(label)).map((label, index) => (
                    <Label mark key={index}>{label}</Label>
                ))
            }
        </>
    );
};

const copyValue = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
        message.success('value copied to clipboard');
    }).catch(() => {
        console.log('Failed to copy to clipboard');
    });
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
                    { name && <Name>{name}</Name> }
                    <Type>fn()</Type>
                    <Value type={value.type}>{value.code}</Value>
                    <Labels value={value} />
                </TreeRow>
            );
        case "null":
            return (
                <TreeRow isExpanded={isExpanded}>
                    { name && <Name>{name}</Name> }
                    <Value type={value.type}>null</Value>
                    <Labels value={value} />
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
                    { name && <Name>{name}</Name> }
                    <Type>{value.type}</Type>
                    <Value type={value.type} onClick={() => copyValue(value.value.toString())}>
                        { JSON.stringify(value.value) }
                    </Value>
                    <Labels value={value} />
                </TreeRow>
            );
        case "array":
            return (
                <>
                    <TreeRow isExpanded={isExpanded} onClick={onClick}>
                        {name && <Name>{name}</Name>}
                        <Type>
                            array {`[${value.length}]`}
                        </Type>
                        <Labels value={value} />
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
                        {name && <Name>{name}</Name>}
                        <Type>
                            object {`{${value.numKeys}}`}
                        </Type>
                        <Labels value={value} />
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
