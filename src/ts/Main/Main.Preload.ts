import { contextBridge, ipcRenderer } from "electron";
import Popup from "../Modules/Core/Popup/Popup";

contextBridge.exposeInMainWorld("ariranha_", {
    Action: (message: string) => {
        ipcRenderer.send("Main", message);
    },
    Application: async (): Promise<Application> => {
        return ipcRenderer.invoke("Application");
    },
    Popup: async (Title: string, Type: PopupTypes, Message: string, Description: string, Close?: boolean): Promise<void> => {
        return ipcRenderer.invoke("Main:Popup", Title, String(Type), Message, Description, Close);
    },
    getClipboard: (callback: (text: string) => void) => {
        ipcRenderer.on('Clipboard', (event, text) => callback(text));
    },
    sendClipboard: async (content: string) => {
        return await ipcRenderer.invoke('Clipboard: Copy', content);
    },
    setInteligentProcessor: async (Enabled: boolean) => {
        return await ipcRenderer.invoke('SmartFormat', Enabled);
    },
});

contextBridge.exposeInMainWorld("WebContent", {
    Log: (Callback: (Message: string, Type: LogTypes) => void) => {
        ipcRenderer.on("New: Log", (event, Message, Type) => Callback(Message, Type));
    }
});

contextBridge.exposeInMainWorld("Plugins_", {
    initCss: (Callback: (CssCode: string) => void) => {
        ipcRenderer.on("Plugins: Css (init)", (event, CssCode) => Callback(CssCode));
    }
});