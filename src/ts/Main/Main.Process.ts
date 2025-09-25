import { ipcMain, clipboard } from 'electron';
import App from "../../../package.json";
import Popup from '../Modules/Core/Popup/Popup';
import SysWindow from '../Modules/Core/Window/Window';
import { Filesystem, Instance, Path, System } from '../Libraries/Libraries';
import { exec } from 'child_process';
import { Log } from '../Modules/Core/Logs/Logs';

let clipboardInterval: NodeJS.Timeout | null = null;

export default function Events(mWindow: SysWindow) {
    mWindow.on('close', (event) => {
        if (clipboardInterval) {
            clearInterval(clipboardInterval);
            clipboardInterval = null;
        }
        Instance.exit();
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

    ipcMain.handle("Terminal", async (event, command) => {
        return new Promise((resolve, reject) => {
            console.log(command);
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    });

    ipcMain.handle("Clipboard: Copy", (event, content) => {
        clipboard.writeText(content);
    });

    ipcMain.handle("SmartFormat", (Event, Enabled) => {
        if (Enabled) {
            if (clipboardInterval) return;
            clipboardInterval = setInterval(() => {
                const text = clipboard.readText();
                if (!text) return;
                if (text.length > 20) return;

                mWindow.webContents.send("Clipboard", text);
            }, 200);
        } else {
            if (clipboardInterval) {
                clearInterval(clipboardInterval);
                clipboardInterval = null;
            }
        }
    });

    ipcMain.handle("getMemoryUsage", async (event) => {
        const info = await process.getProcessMemoryInfo() as { private?: number; shared?: number; residentSet?: number };
        const totalMb = (info.residentSet ?? ((info.private ?? 0) + (info.shared ?? 0))) / 1024;
        return totalMb.toFixed(2);
    });

    ipcMain.handle("createConfFile", (event, content, name, extension) => {
        const tempPath = Path.join(System.homedir(), "Ariranha", "Temp");
        if (!Filesystem.existsSync(tempPath)) {
            Filesystem.mkdirSync(tempPath, { recursive: true });
        }

        const filePath = Path.join(tempPath, `temp.${name}.${extension}`);
        Filesystem.writeFileSync(filePath, content, 'utf8');

        return filePath;
    });

    ipcMain.on("removeTempFile", (event, path) => {
        if (!Filesystem.existsSync(path)) {
            Log.New().Message("removeTempFile", "Não foi possível encontrar os arquivos temporários para efetuar a exclusão. Apenas ignorando chamada.");
        } else {
            Filesystem.unlinkSync(path);
        }
    });
}