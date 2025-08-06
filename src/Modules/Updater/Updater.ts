import { autoUpdater } from "electron-updater";
import SysWindow from "../Core/Window/Window";
import Log from "../Core/Logs/Logs";
import Popup from "../Core/Popup/Popup";

export class Updater {
    public static init(mainWindow: SysWindow) {
        autoUpdater.autoDownload = false;

        autoUpdater.on("checking-for-update", () => {
            Log.New().Message("Updater.init", "Verificando por atualizações...");
        });

        autoUpdater.on("update-available", async () => {
            const Confirm = await Popup.New().Confirm("Nova versão disponível.", "Uma nova versão do sistema está disponível. Deseja atualizar?", mainWindow, false);

            if (Confirm) {
                autoUpdater.downloadUpdate();
            }
        });

        autoUpdater.on("update-not-available", () => {
            Log.New().Message("Updater.init", "Nenhuma atualização está disponível.");
        });

        autoUpdater.on("error", (err) => {
            Log.New().Error("Updater.init", "Ocorreu um erro ao verificar por atualizações, por gentileza, entre em contato com o administrador.");
        });

        autoUpdater.on("update-downloaded", async () => {
            const reiniciar = await Popup.New().Confirm("Atualização instalada", "A atualização foi instalada, deseja reiniciar o programa para inicializar a nova versão?", mainWindow, false);

            if (reiniciar) {
                autoUpdater.quitAndInstall();
            }
        });
    }

    public static checkForUpdates() {
        autoUpdater.checkForUpdates();
        setInterval(() => {
            Log.New().Message("Updater.checkForUpdates", "Verificando atualizações periodicas");
            autoUpdater.checkForUpdates();
        }, 5 * 60 * 1000);
    }
}