import { Filesystem, Instance, Path, System } from "../Libraries/Libraries";
import SysWindow from "../Modules/Core/Window/Window";
import { Log, Web } from "../Modules/Core/Logs/Logs";
import Popup from "../Modules/Core/Popup/Popup";
import Errno from "../Modules/Core/Errno/Errno";
import Events from "./Main.Process";
import { Extension } from "../Modules/Plugins/Plugins";
import { Updater } from "../Modules/Updater/Updater";
import { File } from "../Modules/Core/Files/Files";

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

async function createMainWindow(): Promise<void> {
  if (!Instance.isReady()) await Instance.whenReady();

  try {
    mWindow = new SysWindow({
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
    await Popup.New().Error("Erro ao abrir a janela", "Não foi possível abrir a janela:\n" + Errno.onError(error), undefined, true);
    return;
  }

  try {
    mWindow.loadFile(Path.join(__dirname, "../../../public/Main.html"));
  } catch (error: unknown) {
    await Popup.New().Error("Erro ao abrir a janela", Errno.onError(error), undefined, true);
  }

  try {
    if (!mWindow) {
      throw new Error("Object mWindow is not defined.");
    };
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

  Popup.Set().Parent(mWindow as SysWindow);
  processInitArguments();

  const base: File_Settings_ariranha = {
    token: "none",
    username: "beta",
    settings: {
      general: {
        locale: "pt-BR",
      },
      plugins: {
        loaded: [""],
      },
      developer: {
        enabled: false,
      }
    }
  };

  const Config = new File<File_Settings_ariranha>(Path.join(System.homedir(), "Ariranha", "Settings", "Settings.ariranha"), "base64", base);
  if (!Config.verifyIfFileExists()) {
    Config.createFile(base);
    if (mWindow) mWindow.webContents.send("Settings: data", base);
  } else {
    const fileData = Config.readFile();
    if (mWindow) mWindow.webContents.send("Settings: data", fileData);
  }

  await Extension.init(mWindow as SysWindow);
  mWindow?.webContents.send("AllPluginsFinishedLoad");
  Updater.init(mWindow as SysWindow);
})();