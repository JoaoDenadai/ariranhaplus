import { Instance, Path } from "../Libraries/Libraries";
import Window from "../Modules/Core/Window/Window";
import Popup from "../Modules/Core/Popup/Popup";
import Errno from "../Modules/Core/Logs/Errno";
import events from "./Main.Process";

import { clipboard, Clipboard, globalShortcut, GlobalShortcut } from "electron";
import { Updater } from "../Modules/Updater/Updater";

async function createMainWindow(): Promise<Window | void> {
  if (!Instance.isReady()) await Instance.whenReady();

  let mWindow: Window;
  try {
    mWindow = new Window({
      width: 600,
      height: 700,
      show: false,
      frame: false,
      webPreferences: {
        sandbox: true,
        nodeIntegration: false,
        contextIsolation: true,
        preload: Path.join(__dirname, "Main.Preload.js"),

      }
    });
  } catch (error) {
    await Popup.New().Error("Erro ao abrir a janela", "Não foi possível abrir a janela:\n" + Errno.onError(error), undefined, true);
    return;
  }

  mWindow.on('ready-to-show', () => {
    mWindow.show();
  });

  mWindow.webContents.openDevTools();

  try {
    mWindow.loadFile(Path.join(__dirname, "../", "../", "public", "Main.html"));
  } catch (error: unknown) {
    await Popup.New().Error("Erro ao abrir a janela", Errno.onError(error), undefined, true);
  }

  events(mWindow);
  await mWindow.awaitFocus();

  Updater.init(mWindow);
  Updater.checkForUpdates();

  return mWindow;
}

(async function main() {
  await Instance.whenReady();
  const AppWindow: Window = await createMainWindow() as Window;

  Popup.Set().Parent(AppWindow);
})();