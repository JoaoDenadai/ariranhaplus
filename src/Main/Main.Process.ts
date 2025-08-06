import { ipcMain, clipboard } from 'electron';
import { Instance } from '../Libraries/Libraries';
import App from "../../package.json";
import Popup from '../Modules/Core/Popup/Popup';
import SysWindow from '../Modules/Core/Window/Window';

let clipboardInterval: NodeJS.Timeout | null = null;

export default function events(mWindow: SysWindow) {
    mWindow.on('close', (event) => {
        event.preventDefault();
        mWindow.hide();
    });

    ipcMain.on('Main', (event, message: string) => {
        if ((message.toLowerCase()).includes("close")) {
            mWindow.close();
        }
        if ((message.toLowerCase()).includes("minimize")) {
            mWindow.minimize();
        }
    });

    ipcMain.handle("Application", async (event) => {
        return App as Application;
    });

    ipcMain.handle("Main:Popup", async (event, Title: string, Type: string, Message: string, Description: string, Close?: boolean) => {
        return await Popup.MessageBoxFromFrontend(Title, Type, Message, Description, Close ?? false);
    });

    ipcMain.handle("Clipboard: Copy", (event, content) => {
        clipboard.writeText(content);
    });

    ipcMain.handle("IP", (Event, Enabled) => {
        if (Enabled) {
            if (clipboardInterval) return;
            clipboardInterval = setInterval(() => {
                const text = clipboard.readText();
                if (!text || text.length > 20) return;
                mWindow.webContents.send("Clipboard", text);
            }, 200);
        } else {
            if (clipboardInterval) {
                clearInterval(clipboardInterval);
                clipboardInterval = null;
            }
        }
    });
}