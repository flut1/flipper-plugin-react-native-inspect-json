# flipper-plugin-react-native-inspect-json

This plugin shows a tree view of a serializable object in your React Native app. It is specifically intended for objects 
that are too large to continuously sync with Flipper desktop. Instead, this plugin will only sync the parts of the 
object which have been expanded in the tree view in Flipper. 

The plugin has been created for usage with a global MobX store, of which you can find an example below. However, it should
also work with other kinds of objects. Keep in mind that this plugin does not track changes to the object and send
updates to Flipper accordingly. You would have to implement your own method that calls `updateState()`.

