import { __ambientBridge__functions__, __api__functions__, __html__functions__, __sql__functions__ } from "./Functions";

export { };

declare global {
    interface PluginModule {
        init?: (api = __api__functions__, html = __html__functions__, sql = __sql__functions__, ambientBridgeServer: __ambientBridge__functions__) => void;
    }
}