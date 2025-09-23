import App from "../package.json";
export { };

declare global {
    type Application = typeof App;

    interface MessageBoxData {
        Type: string,
        Title: string,
        Message: string,
        Description: string,
    };

    interface File_Settings_ariranha {
        token: string,
        username: string,
        settings: {
            general: {
                locale: string,
            }
            plugins: {
                loaded: string[],
            }
            developer: {
                enabled: boolean
            }
        }
    }

    type PopupTypes = "Message" | "Confirm" | "Warning" | "Error";
    type LogTypes = "Message" | "Warning" | "Error";

    interface Window {
        Popup_: {
            getMessageData(callback: (data: MessageBoxData) => void): void;
            onClickCallback(channel: string, message: string): void;
        };
        ariranha_: {
            Action: (message: string) => void;
            Application: (channel: string) => Promise<Application>;
            Popup: (Title: string, Type: PopupTypes, Message: string, Description: string, Close?: boolean) => Promise<void | boolean>;
            getClipboard: (callback: (text: string) => void) => void;
            sendClipboard: (content: string) => Promise<any>;
            setInteligentProcessor: (Enabled: boolean) => Promise<any>;
            ReceiveSettingsData: (callback: (content: File_Settings_ariranha) => void) => void;
            getMemoryUsage: () => Promise<any>;
        };
        WebContent: {
            Log: (Callback: (Message: string, Type: LogTypes) => void) => void
        }
        Plugins_: {
            initCss: (Callback: (CssCode: string) => void) => void
            initJs: (Callback: (JsCode: string) => void) => void
            addNewTab: (Callback: (Title: string) => void) => void
            insertContentInElementId: (Callback: (targetId: string, html: string, css: string, js: string) => void) => void
            Terminal: (args: string) => Promise<any>
            AllPluginsFinishedLoad: (callback: () => void) => void
        }
    }
}