import { autoUpdater } from "electron-updater";
import SysWindow from "../Core/Window/Window";
import { Log } from "../Core/Logs/Logs";
import Popup from "../Core/Popup/Popup";

export class Updater {
    private static WIN_mWindow: SysWindow;
    private static LET_checkUpdatesDelayTime = 5;

    private static listeners() {
        autoUpdater.on("checking-for-update", () => {
            Log.New().Message("Updater.listeners", "Procurando por atualizações...");
        });

        autoUpdater.on("update-available", async () => {
            const Confirm = await Popup.New().Confirm("Nova versão disponível.", "Uma nova versão do sistema está disponível. Deseja instalar a atualização?", Updater.WIN_mWindow, false);

            if (Confirm) {
                autoUpdater.downloadUpdate();
            }
        });

        autoUpdater.on("update-not-available", () => {
            Log.New().Message("Updater.listeners", "Nenhuma atualização está disponível.");
        });

        autoUpdater.on("error", (err) => {
            Log.New().Error("Updater.listeners", "Ocorreu um erro ao verificar por atualizações: " + err);
        });

        autoUpdater.on("update-downloaded", async () => {
            await Popup.New().Message("A atualização foi instalada.", "A atualização foi instalada. O programa será reiniciado para aplicar as mudanças.", Updater.WIN_mWindow, false);
            autoUpdater.quitAndInstall();
        });
    }

    private static checkForUpdatesInBackground() {
        setInterval(() => {
            Log.New().Message("Updater.checkForUpdatesInBackground", "Verificando por atualizações em segundo plano.");
            autoUpdater.checkForUpdates();
        }, Updater.LET_checkUpdatesDelayTime * 60 * 1000);
    }

    public static init(mWindow: SysWindow) {
        autoUpdater.autoDownload = false;
        Updater.WIN_mWindow = mWindow;

        autoUpdater.checkForUpdates();
        Updater.listeners();
        Updater.checkForUpdatesInBackground();
    }
}