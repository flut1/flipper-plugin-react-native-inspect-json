import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import type {State, Subscriptions, ObjectSubscriptions} from "../lib/types";
import DataTree from "./DataTree";

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
  let ready = false;

  client.onConnect(() => {
    client.onMessage('state', newState => {
      stateData.set(newState);
    });
    client.onMessage('init', () => {
      ready = true;
      client.send('setSubscriptions', persistentData.get().subscriptions);
    });
  });

  client.onDisconnect(() => {
    ready = false;
  });

  client.onActivate(() => {
    if (ready) {
      client.send('setSubscriptions', persistentData.get().subscriptions);
    }
  });

  return {
    stateData,
    subscribe(path: string) {
      const segments = path.replace(/^\./,'').split('.');
      persistentData.update(draft => {
        let current: ObjectSubscriptions = draft.subscriptions || {};

        segments.forEach(segment => {
          current[segment] = current[segment] || {};
          current = current[segment] as ObjectSubscriptions;
        });

        return draft;
      });
      client.send('setSubscriptions', persistentData.get().subscriptions);
    },
    unsubscribe(path: string) {
      const segments = path.replace(/^\./,'').split('.');
      persistentData.update(draft => {
        let current: ObjectSubscriptions = draft.subscriptions || {};

        const finalSegment = segments.pop();
        if (!finalSegment) {
          return null;
        }

        for (const segment of segments) {
          if (!current[segment]) {
            return draft;
          }
          current = current[segment] as ObjectSubscriptions;
        }
        if (current) {
          delete current[finalSegment];
        }
        return draft;
      });
      if (ready) {
        client.send('setSubscriptions', persistentData.get().subscriptions);
      }
    }
  };
}

export function Component() {
  const instance = usePlugin(plugin);
  const data = useValue(instance.stateData);

  return (
    <Layout.ScrollContainer>
      {data ? (
          <DataTree state={data} subscribe={instance.subscribe} unsubscribe={instance.unsubscribe} />
      ) : 'waiting for device connection...'}
    </Layout.ScrollContainer>
  );
}
