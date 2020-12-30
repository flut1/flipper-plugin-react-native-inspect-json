import React, {FunctionComponent, useContext, useMemo} from 'react';
import {keyframes} from '@emotion/react';
import {styled} from 'flipper-plugin';
import TreeContext from "./TreeContext";

export const TreeRowWrapper = styled.div`
  margin: 0;
  display: flex;
  justify-content: flex-start;
  padding: 0;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  background: none;
  border: none;
  align-items: flex-start;
`;

export const ExpandIndicator = styled.div`
  flex: 0 0 auto;
  margin-left: 5px;
  padding-top: 4px;
  color: #3d35a2;
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
    path?: string,
    isRoot?: boolean,
}> = ({ path, isExpanded, children, isRoot }) => {
    const { subscribe, unsubscribe } = useContext(TreeContext);

    const isExpandable = !isRoot && typeof isExpanded === 'boolean';
    const onClick = isExpandable ? (() => {
        (isExpanded ? unsubscribe : subscribe)(path!);
    }) : undefined;

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

const SubTreeEl: FunctionComponent<{ className?: string, hasExpanded?: boolean, isRoot?: boolean }> =
    ({ className, children }) => <div className={className}>{children}</div>;

export const SubTree = styled(SubTreeEl)`
  margin-left: ${({ isRoot }) => isRoot ? 1.2 : 2.4}rem;
  margin-bottom: 1rem;
  border-left: 1px dashed #ccc;
  overflow: hidden;
  
  animation: ${({ hasExpanded }) => hasExpanded ? appear : 'none'} 0.3s ease-out backwards;
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

const ValueWrapper = styled.div`
  flex: 1 0 0;
  overflow: hidden;
  padding: 5px 0;
  margin: 0 10px;
  text-overflow: ellipsis;
  box-sizing: border-box;
  white-space: nowrap;
`;

export const Type = styled.div`
  flex: 0 0 auto;
  color: #999;
  padding: 5px 5px 5px 0;
  min-width: 3rem;
  text-align: left;
`;

export const Value: FunctionComponent = ({ children }) => {
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
            {JSON.stringify(children)}
        </ValueWrapper>
    );
};
