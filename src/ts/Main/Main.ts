import { Filesystem, Instance, Path } from "../Libraries/Libraries";
import SysWindow from "../Modules/Core/Window/Window";
import { Log, Web } from "../Modules/Core/Logs/Logs";
import Popup from "../Modules/Core/Popup/Popup";
import Errno from "../Modules/Core/Errno/Errno";
import Events from "./Main.Process";
import { PluginRuntime, __api__, __html__ } from "../Modules/Plugins/Plugins";

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

  try {
    mWindow.loadFile(Path.join(__dirname, "../../../public/Main.html"));
  } catch (error: unknown) {
    await Popup.New().Error("Erro ao abrir a janela", Errno.onError(error), undefined, true);
  }

  try {
    if (!mWindow) return;
    Events(mWindow);
  } catch (error: unknown) {
    await Popup.New().Error("Erro ao registrar eventos da janela", Errno.onError(error), undefined, true);
  }

  await new Promise<void>((resolve, reject) => {
    if (!mWindow) {
      reject();
      return;
    }

    mWindow.webContents.on('did-finish-load', async () => {
      if (mWindow) {
        mWindow.show();
        await mWindow.awaitFocus();
      }
      resolve();
    });
  });

  mWindow.webContents.openDevTools();

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
  await createMainWindow();

  Popup.Set().Parent(mWindow as SysWindow);
  PluginRuntime.load(mWindow as SysWindow);

  Updater.init(mWindow as SysWindow);
  Updater.checkForUpdates();
})();