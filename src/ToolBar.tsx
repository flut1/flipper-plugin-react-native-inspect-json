import React, {FunctionComponent, useState, useRef, useEffect} from "react";
import {styled, theme, useValue, usePlugin} from "flipper-plugin";
import {Checkbox} from "antd";
import {ResetButton} from "./uiComponents";
import {plugin} from "./index";

const ToolbarWrapper = styled.div`
    height: 42px;
    display: flex;
    padding: 0 15px;
    align-items: center;
    line-height: 32px;
    background: ${theme.backgroundDefault};
    border-bottom: 1px solid ${theme.dividerColor};
`;

const Toolbar: FunctionComponent = () => {
    const instance = usePlugin(plugin);
    const { showHidden, showLabels } = useValue(instance.persistentData);

    return (
        <ToolbarWrapper>
            <Checkbox checked={showLabels} onClick={() => instance.toggleOption('showLabels')}>show labels</Checkbox>
            <Checkbox checked={showHidden} onClick={() => instance.toggleOption('showHidden')}>show hidden properties</Checkbox>
            <ResetButton size="small" onClick={instance.reset}>force reset</ResetButton>
        </ToolbarWrapper>
    )
};

export default Toolbar;
