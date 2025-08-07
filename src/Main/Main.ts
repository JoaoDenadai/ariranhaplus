import { Instance, Path } from "../Libraries/Libraries";
import SysWindow from "../Modules/Core/Window/Window";
import Log from "../Modules/Core/Logs/Logs";
import Popup from "../Modules/Core/Popup/Popup";
import Errno from "../Modules/Core/Errno/Errno";
import Events from "./Main.Process";

import { Updater } from "../Modules/Updater/Updater";

let mWindow: SysWindow | undefined;

function singleInstanceLock(): boolean {
  const mLock = Instance.requestSingleInstanceLock();

  if (!mLock) {
    Instance.quit();
    return false;
  }

  Instance.once("second-instance", () => {
    if (mWindow) {
      if (mWindow.isMinimized()) mWindow.restore();
      mWindow.focus();
    }
  });

  return true;
}

async function createMainWindow(): Promise<SysWindow | void> {
  if (!Instance.isReady()) await Instance.whenReady();

  try {
    mWindow = new SysWindow({
      width: 600,
      height: 600,
      //minWidth: 475,
      //maxWidth: 700,
      // minHeight: 225,
      //maxHeight: 260,
      show: false,
      frame: false,
      webPreferences: {
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
    if (mWindow) {
      mWindow.show();
    }
  });

  try {
    mWindow.loadFile(Path.join(__dirname, "../", "../", "public", "Main.html"));
  } catch (error: unknown) {
    await Popup.New().Error("Erro ao abrir a janela", Errno.onError(error), undefined, true);
  }

  mWindow.webContents.openDevTools();

  const mWindow_events = async () => {
    try {
      if (!mWindow) return;
      Events(mWindow);
      await mWindow.awaitFocus();
    } catch (error: unknown) {
      await Popup.New().Error("Erro ao registrar eventos da janela", Errno.onError(error), undefined, true);
    }
  };

  mWindow_events();

  return mWindow;
}

(async function main() {

  const mLock = singleInstanceLock();
  if (!mLock) {
    Log.New().Error("main", "Não é possível abrir mais de uma instância do programa.");
    Log.New().Message("main", "Focando para instância já aberta e encerrando a segunda chamada.");
    return;
  };

  await Instance.whenReady();
  const AppWindow: SysWindow = await createMainWindow() as SysWindow;

  Popup.Set().Parent(AppWindow);

  Updater.init(AppWindow);
  Updater.checkForUpdates();
})();