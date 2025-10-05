import { contextBridge, ipcRenderer } from "electron";

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
    ReceiveSettingsData: (callback: (content: File_Settings_ariranha) => void) => {
        ipcRenderer.on("Settings: data", (event, content) => callback(content));
    },
    getMemoryUsage: async () => {
        return await ipcRenderer.invoke('getMemoryUsage');
    },
});

contextBridge.exposeInMainWorld("WebContent", {
    Log: (Callback: (Message: string, Type: LogTypes) => void) => {
        ipcRenderer.on("New: Log", (event, Message, Type) => Callback(Message, Type));
    },
    createTempFile: async (Content: string, Name: string, Extension: string) => {
        return await ipcRenderer.invoke('createConfFile', Content, Name, Extension);
    },
    removeTempFile: (path: any) => {
        ipcRenderer.send("removeTempFile", path);
    }
});

contextBridge.exposeInMainWorld("Plugins_", {
    initCss: (Callback: (CssCode: string) => void) => {
        ipcRenderer.on("Plugins: Css (init)", (event, CssCode) => Callback(CssCode));
    },
    initJs: (Callback: (JsCode: string) => void) => {
        ipcRenderer.on("Plugins: Js (load)", (event, JsCode) => Callback(JsCode));
    },
    addNewTab: (Callback: (Title: string) => void) => {
        ipcRenderer.on("Plugins: addNewTab (load)", (event, Title) => Callback(Title));
    },
    addNewContent: (Callback: (Tabtitle: string, html: string) => void) => {
        ipcRenderer.on("Plugins: addNewContent (load)", (event, Tabtitle, html) => Callback(Tabtitle, html));
    },
    insertContentInElementId: (Callback: (targetId: string, html: string, css: string, js: string) => void) => {
        ipcRenderer.on("Plugins: insertContent (load)", (event, targetId, html, css, js) => Callback(targetId, html, css, js));
    },
    Terminal: async (command: string) => {
        return await ipcRenderer.invoke("Terminal", command);
    },
    AllPluginsFinishedLoad: (callback: () => void) => {
        ipcRenderer.on('AllPluginsFinishedLoad', (event) => callback());
    }
});

contextBridge.exposeInMainWorld("ambientBridge", {
    //Client
    sendToServer: async (channel: string, ...args: any[]) => {
        return await ipcRenderer.invoke(channel, ...args);
    },

    addResponse: (channel: string, callback: (...args: any[]) => any) => {
        ipcRenderer.on(channel, async (event, ...args) => {
            const result = await callback(event, ...args);
            ipcRenderer.send(channel, result);
        });
    },
});