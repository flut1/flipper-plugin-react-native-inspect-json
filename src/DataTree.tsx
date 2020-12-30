import React, {FunctionComponent, useMemo} from 'react';
import {styled} from 'flipper-plugin';
import {State} from "../lib/types";

interface Props {
    state: State;
    subscribe(path: string): void;
    unsubscribe(path: string): void;
    name?: string;
    path?: string;
}

const Row = styled.div({
    margin: 0,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 5,
});

const ValueWrapper = styled.div({
    flex: '0 0 auto',
    overflow: 'hidden',
    paddingTop: 5,
    paddingBottom: 5,
});

const Value: FunctionComponent = ({ children }) => {
    const processedValue = useMemo(() => {
        if (typeof children === 'string' && children.length > 38) {
            return JSON.stringify(`${children.substring(0, 35)}...`);
        }
        return JSON.stringify(children);
    }, [children]);

    let color: string = '#000';
    switch (typeof children) {
        case "boolean":
            color = '#923237';
            break;
        case "number":
            color = '#4a2f9e';
            break;
        case "string":
            color = '#e09e1b';
            break;
        default:
            break;
    }

    return (
        <ValueWrapper style={{color}}>
            {processedValue}
        </ValueWrapper>
    );
};

const NameWrapper = styled.div({
    flex: '0 0 auto',
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
});

const Name: FunctionComponent = ({ children }) => (
    <NameWrapper>
        {children}:
    </NameWrapper>
);

const Type = styled.div({
    flex: '0 0 auto',
    color: '#999',
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
});

const SubscribeButtonWrapper = styled.div({
    flex: '0 0 1.5rem',
    height: '1.5rem',
});

const SubscribeButton = styled.button({
    width: '.8rem',
    height: '.8rem',
    border: '1px solid #282828',
    display: 'block',
    background: 'none',
    padding: 2,
    lineHeight: '.8rem',
    boxSizing: 'content-box',
    cursor: 'pointer'
});

const SubTree = styled.div({
    marginLeft: '2rem',
});

const DataTree: FunctionComponent<Props> = ({ state, name, path = '', subscribe, unsubscribe }) => {
    if (typeof state !== 'object' || state === null) {
        return (
            <Row>
                <SubscribeButtonWrapper />
                { name && <Name>{name}</Name> }
                <Value>{ state }</Value>
            </Row>
        );
    }

    const handleSubscribeClick = () => {
        if ('values' in state) {
            return unsubscribe(path);
        }

        return subscribe(path);
    }

    switch (state.type) {
        case "array":
            return (
                <>
                    <Row>
                        <SubscribeButtonWrapper>
                            <SubscribeButton onClick={handleSubscribeClick}>{state.values ? '-' : '+'}</SubscribeButton>
                        </SubscribeButtonWrapper>
                        { name && <Name>{name}</Name> }
                        <Type>array [{state.length}]</Type>
                    </Row>
                    {
                        state.values && (
                            <SubTree>
                                {
                                    state.values.map((value, index) => (
                                        <DataTree
                                            state={value}
                                            subscribe={subscribe}
                                            unsubscribe={unsubscribe}
                                            key={index}
                                            name={`[${index}]`}
                                            path={`${path}.${index}`}
                                        />
                                    ))
                                }
                            </SubTree>
                        )
                    }
                </>
            );
        case "object":
            return (
                <>
                    <Row>
                        <SubscribeButtonWrapper>
                            <SubscribeButton onClick={handleSubscribeClick}>{state.values ? '-' : '+'}</SubscribeButton>
                        </SubscribeButtonWrapper>
                        { name && <Name>{name}</Name> }
                        <Type>object {'{'}{state.numKeys}{'}'}</Type>
                    </Row>
                    {
                        state.values && (
                            <SubTree>
                                {
                                    Object.entries(state.values).map(([key, value]) => (
                                        <DataTree
                                            state={value}
                                            subscribe={subscribe}
                                            unsubscribe={unsubscribe}
                                            key={key}
                                            name={key}
                                            path={`${path}.${key}`}
                                        />
                                    ))
                                }
                            </SubTree>
                        )
                    }
                </>
            );
        case "function":
            return (
                <Row>
                    <SubscribeButtonWrapper />
                    { name && <Name>{name}</Name> }
                    <Type>function</Type>
                    <Value>{state.code}</Value>
                </Row>
            );
        case "unknown": {
            return (
                <Row>
                    <SubscribeButtonWrapper />
                    { name && <Name>{name}</Name> }
                    <Type>&gt;unknown type&lt;</Type>
                </Row>
            );
        }
        default:
            return null;
    }
}

export default DataTree;
