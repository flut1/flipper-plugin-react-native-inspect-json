import React, {useEffect} from 'react';
import {Alert} from "antd";
import {usePlugin, useValue, Layout} from 'flipper-plugin';
import DataTree from "./DataTree";
import {ContentWrapper, SubTree} from "./uiComponents";
import Toolbar from "./ToolBar";
import plugin_ from './plugin';

export const plugin = plugin_;

export function Component() {
    const instance = usePlugin(plugin_);
    const { data, ready } = useValue(instance.localState);
    const { subscriptions } = useValue(instance.persistentData);

    return (
        <Layout.Top>
            <Toolbar />
            <Layout.ScrollContainer vertical>
                <ContentWrapper>
                    {
                        ready && !data['.'] && (
                            <Alert message="Waiting for app to send state" type="info" />
                        )
                    }
                    {
                        !ready && (
                            <Alert message="Waiting for app to connect to plugin" type="info" />
                        )
                    }
                    { data['.'] && (
                        <>
                            <SubTree isRoot>
                                <DataTree
                                    state={data}
                                    subscriptions={subscriptions}
                                    path="."
                                />
                            </SubTree>
                        </>
                    ) }
                </ContentWrapper>
            </Layout.ScrollContainer>
        </Layout.Top>
    );
}
