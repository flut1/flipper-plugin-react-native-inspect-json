# flipper-plugin-react-native-inspect-json

This plugin shows a tree view of a serializable object in your React Native app. It is specifically intended for objects 
that are too large to continuously sync with Flipper desktop. Instead, this plugin will only sync the parts of the 
object which have been expanded in the tree view in Flipper. 

The plugin has been created for usage with a global MobX store, of which you can find an example below. However, it should
also work with other kinds of objects. Keep in mind that this plugin does not track changes to the object. If you don't
use MobX, you would have to implement your own change tracking that calls `updateState()`.

## Compatibility 
This plugin has been tested with Flipper and `react-native-flipper` 0.75.0

## Installation
In Flipper:

* Open Flipper
* Goto "manage plugins"
* Search for "react-native-inspect-json"
* Hit "install" on the plugin
* Restart

In your react-native app:

```typescript
yarn add flipper-plugin-react-native-inspect-json-client react-native-flipper
```

## Example -- TypeScript and MobX

```typescript
import bootstrap, { Subscriptions } from 'flipper-plugin-react-native-inspect-json-client';
import {comparer, reaction} from 'mobx';
import {IReactionDisposer} from 'mobx/lib/internal';

function storeFlipperPlugin(store: Store) {
    if (__DEV__) {
        const plugin = bootstrap();

        /* we create a MobX reaction for each expanded object in Flipper */
        const reactions: Record<string, IReactionDisposer> = {};

        /* this method is called whenever subscriptions update */
        plugin.onSubscriptionsUpdate = (subscriptions: Subscriptions) => {
            Object.keys(reactions)
                .filter(key => !subscriptions.includes(key))
                .forEach(key => {
                    /* disposes a reaction */
                    reactions[key]();
                    delete reactions[key];
                });

            for (const subscription of subscriptions) {
                reactions[subscription] = reaction(
                    /* generate a shallow description of the object at the given path */
                    () => {
                        const object = plugin.getAtPath(store, subscription);
                        return plugin.generateStateSegment(object);
                    },
                    /* when that description changes, send it to Flipper */
                    (segment) => {
                        if (segment) {
						    plugin.updateSegment(subscription, segment || null);
                        }
                    },
                    {
                        /* use deep equality to check if the description has changed */
                        equals: comparer.structural,
                        /* send it once immediately */
                        fireImmediately: true,
						delay: 100,
                    }
                );
            }
        };

        plugin.onDisconnect = () => {
            /* dispose all reactions */
            Object.keys(reactions)
                .forEach(key => {
                    reactions[key]();
                    delete reactions[key];
                });
        };
    }
}
```

## API

Todo