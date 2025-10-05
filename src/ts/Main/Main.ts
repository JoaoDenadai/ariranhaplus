import { Filesystem, Instance, Path, System } from "../Libraries/Libraries";
import _Window_ from "../Modules/Core/Window/Window";
import { Log, Web } from "../Modules/Core/Logs/Logs";
import Popup from "../Modules/Core/Popup/Popup";
import Events from "./Main.Process";
import { Extension } from "../Modules/Plugins/Plugins";
import { Updater } from "../Modules/Updater/Updater";

let mWindow: _Window_ | undefined;

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

async function createMainWindow(): Promise<void> {
  if (!Instance.isReady()) await Instance.whenReady();

  try {
    mWindow = new _Window_({
      width: 720,
      height: 450,
      minHeight: 280,
      maxHeight: 1000,
      minWidth: 475,
      maxWidth: 1000,
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: Path.join(__dirname, "Main.Preload.js"),
      }
    });
  } catch (error) {
    await Popup.New().Error("Erro ao abrir a janela", "Não foi possível abrir a janela:\n" + error, undefined, true);
    return;
  }

  try {
    mWindow.loadFile(Path.join(__dirname, "../../../public/Main.html"));
  } catch (error: unknown) {
    await Popup.New().Error("Erro ao abrir a janela", error as string, undefined, true);
  }

  try {
    if (!mWindow) {
      throw new Error("Object mWindow is not defined.");
    };
    Events(mWindow);
  } catch (error: unknown) {
    await Popup.New().Error("Erro ao registrar eventos da janela", error as string, undefined, true);
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
        await Extension.init(mWindow);
      }
      resolve();
    });
  });

  return;
}

function processInitArguments() {
  const args = process.argv;

  if (args.includes("--dev")) {
    if (!mWindow) return;
    mWindow.webContents.openDevTools();
  };
};

(async function main() {

  const mLock = singleInstanceLock();

  if (!mLock) {
    Log.New().Error("main", "Não é possível abrir mais de uma instância do programa.");
    Log.New().Message("main", "Focando para instância já aberta e encerrando a segunda chamada.");
    return;
  };

  await Instance.whenReady();
  await createMainWindow();

  Popup.Set().Parent(mWindow as _Window_);
  processInitArguments();

  mWindow?.webContents.send("AllPluginsFinishedLoad");
  Updater.init(mWindow as _Window_);
})();