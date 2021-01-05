import React, {FunctionComponent, useState, useEffect} from 'react';
import {keyframes} from '@emotion/react';
import {styled, theme} from 'flipper-plugin';
import {Typography} from "antd";

export const TreeRowWrapper = styled.div`
  margin: 0;
  display: flex;
  justify-content: flex-start;
  padding: 0;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  border: none;
  text-align: left;
  width: 100%;
  align-items: flex-start;
  transition: background-color 0.2s ease-out;
  background-color: transparent;
  
  &:hover {
    background-color: ${theme.backgroundWash};
  }
`;

export const ExpandIndicator = styled.div`
  flex: 0 0 auto;
  margin-left: 5px;
  padding-top: 4px;
  color: #3d35a2;
  margin-right: auto;
`;

export const RowLine = styled.div`
  flex: 0 0 1rem;
  height: 1px;
  border-bottom: 1px dashed #CCC;
  align-self: center;
  margin-right: 5px;
`

export const TreeRow: FunctionComponent<{
    isExpanded?: boolean,
    isRoot?: boolean,
    onClick?: () => void;
}> = ({
    onClick,
    isExpanded,
    children,
    isRoot,
}) => {
    const isExpandable = !!onClick;

    return (
        <TreeRowWrapper as={isExpandable ? 'button' : 'div'} onClick={onClick}>
            { !isRoot && <RowLine /> }

            {children}

            { isExpandable && <ExpandIndicator>{isExpanded ? '-' : '+'}</ExpandIndicator>}
        </TreeRowWrapper>
    );
};

const appear = keyframes`
  0% {
    max-height: 0;
  }
  100% {
    max-height: 12rem;
  }
`;

const SubTreeEl: FunctionComponent<{ className?: string, hasAppeared?: boolean, isRoot?: boolean }> =
    ({ className, children }) => <div className={className}>{children}</div>;

export const SubTree = styled(SubTreeEl)`
  margin-left: ${({ isRoot }) => isRoot ? 1.2 : 2.4}rem;
  margin-bottom: 1rem;
  border-left: 1px dashed #ccc;
  overflow: hidden;
  
  animation: ${({ hasAppeared }) => hasAppeared ? appear : 'none'} 0.3s ease-out backwards;
`;

const ObjectIndicatorWrapper: FunctionComponent<{className?: string, characters: string}> = ({ className, children }) => (
    <div className={className}>
        <span>{children}</span>
    </div>
);

export const ObjectIndicator = styled(ObjectIndicatorWrapper)`
  display: inline-block;
  span {
      display: inline-block;
      min-width: 1.5rem;
      text-align: center;
  }
  
  &:before {
    content: '${({ characters }) => characters[0]}';
  }
  
  &:after {
    content: '${({ characters }) => characters[1]}';
  }
`;

export const ContentWrapper = styled.div`
  padding: 1rem;
  font-size: 1rem;
  width: 100%;
`;

export const Type = styled.div`
  flex: 0 0 auto;
  color: #999;
  padding: 5px 5px 5px 0;
  min-width: 3rem;
  text-align: left;
`;

export const Name = styled.div`
  flex: 0 0 auto;
  padding: 5px 0;
`;

export const Label = styled(Typography.Text)`
  flex: 0 0 auto;
  padding: 5px;
`;

const flash = keyframes`
  0% {
    background-color: #F66E6E;
  }
  100% {
    background-color: transparent;
  }
`;
const flash2 = keyframes`
  0% {
    background-color: #F66E6F;
  }
  100% {
    background-color: transparent;
  }
`;

const ValueWrapper = styled.div`
  flex: 0 1 auto;
  overflow: hidden;
  padding: 5px 5px;
  margin: 0 5px;
  text-overflow: ellipsis;
  box-sizing: border-box;
  white-space: nowrap;
  transition: background-color 0.2s ease-out;
  background-color: transparent;
  border: none;
  display: block;
  appearance: none;
  cursor: ${(props) => props.onClick ? 'pointer' : 'default'};
  
  &.changed1 {
    animation: ${flash} 0.3s ease-out both;
  }
  
  &.changed2 {
    animation: ${flash2} 0.3s ease-out both;
  }
  
  &:hover {
    background-color: ${(props) => props.onClick ? theme.backgroundTransparentHover : 'transparent'};
  }
`;

export const Value: FunctionComponent<{
    type: 'boolean' | 'string' | 'number' | 'null' | 'function' | 'undefined',
    onClick?: () => any,
    children: string | boolean | number
}> = ({ children, type, onClick }) => {
    const [changedFlag, setChangedFlag] = useState('');
    const [valueCache, setValueCache] = useState(children);

    useEffect(() => {
        if (children !== valueCache) {
            setValueCache(children);
            setChangedFlag(changedFlag === 'changed1' ? 'changed2' : 'changed1');
        }
    }, [children]);

    let color: string = '#000';
    switch (type) {
        case "boolean":
            color = '#923237';
            break;
        case "number":
            color = '#4a2f9e';
            break;
        case "string":
            color = '#e09e1b';
            break;
        case "function":
            color = '#666';
            break;
        default:
            break;
    }

    return (
        <ValueWrapper
            as={onClick ? 'button' : undefined}
            style={{color}}
            onClick={onClick}
            className={changedFlag}
        >
            {children}
        </ValueWrapper>
    );
};
