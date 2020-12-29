import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import type {State, Subscriptions} from "../lib/types";

type PersistentData = {
  subscriptions: Subscriptions
};

type Events = {
  state: State;
  init: { hello: string };
};

type Methods = {
  setSubscriptions(newSubscriptions: Subscriptions): Promise<{ ack: true }>,
}

export function plugin(client: PluginClient<Events, Methods>) {
  const persistentData = createState<PersistentData>({
    subscriptions: {}
  }, {persist: `data_${client.appId}`});
  const stateData = createState<State | null>(null);

  client.onConnect(() => {
    client.onMessage('state', newState => {
      stateData.set(newState);
    })
    client.onMessage('init', newState => {
      client.send('setSubscriptions', persistentData.get().subscriptions);
    })
  });

  return { stateData };
}

export function Component() {
  const instance = usePlugin(plugin);
  const data = useValue(instance.stateData);

  return (
    <Layout.ScrollContainer>
      {data && Object.entries(data).map(([id, d]) => (
        <pre key={id} data-testid={id}>
          {id}: {JSON.stringify(d)}
        </pre>
      ))}
    </Layout.ScrollContainer>
  );
}
