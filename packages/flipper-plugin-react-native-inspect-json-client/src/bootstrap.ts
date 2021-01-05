import {
    Options
} from "./types";
import PluginClient from "./PluginClient";

export default function bootstrap(options: Partial<Options> = {}): PluginClient {
    return new PluginClient(options);
}
