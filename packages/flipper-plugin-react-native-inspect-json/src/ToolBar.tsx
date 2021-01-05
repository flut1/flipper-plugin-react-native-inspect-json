import React, {FunctionComponent} from "react";
import {styled, theme, useValue, usePlugin} from "flipper-plugin";
import {Select, Button, Switch} from "antd";
import plugin from './plugin';

const ToolbarWrapper = styled.div`
    min-height: 42px;
    background: ${theme.backgroundDefault};
    border-bottom: 1px solid ${theme.dividerColor};
    padding: 0 15px;
    flex-wrap: wrap;
    align-items: center;
    display: flex;
    line-height: 32px;
`;

const ToolbarDivider = styled.div`
  flex: 0 0 1px;
  margin: 0 10px;
  height: 42px;
  border-right: 1px solid ${theme.dividerColor};
`;

const LabelSelectWrapper = styled.div`
  flex: 0 0 300px;
  margin-right: 10px;
`;

const Toolbar: FunctionComponent = () => {
    const instance = usePlugin(plugin);
    const { showHidden, hiddenLabels, labels } = useValue(instance.persistentData);

    const toggleHidden = () => instance.toggleOption('showHidden');

    return (
        <ToolbarWrapper>
            <span style={{ paddingRight: 10, cursor: "pointer" }} onClick={toggleHidden}>show hidden properties:</span>
            <Switch
                size="small"
                checked={showHidden}
                onClick={toggleHidden}
            />
            <ToolbarDivider />

            <span style={{ marginRight: 10 }}>show labels:</span>
            <LabelSelectWrapper>
                {
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ minWidth: 300 }}
                        placeholder="no labels visible"
                        value={labels.filter(label => !hiddenLabels.includes(label))}
                        onChange={instance.setVisibleLabels as any}
                        maxTagCount={2}
                    >
                        {labels.map((label, index) => (
                            <Select.Option key={index} value={label}>{ label }</Select.Option>
                        ))}
                    </Select>
                }
            </LabelSelectWrapper>
            <ToolbarDivider />
            <Button size="small" onClick={instance.reset}>force reset</Button>
        </ToolbarWrapper>
    )
};

export default Toolbar;
