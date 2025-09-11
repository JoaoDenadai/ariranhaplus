
import { Filesystem, Path, System } from "../../Libraries/Libraries";
import { Log, Web } from "../Core/Logs/Logs";
import SysWindow from "../Core/Window/Window";
import { __api__functions__, __html__functions__ } from "./Functions";


export class Extension {
    private static DIR_ExtensionDirectory: string = Path.join(System.homedir(), "Ariranha", "Plugins");
    private static WIN_ExtensionWindow: SysWindow;
    private static ExtensionsLoaded: string[] = [];
    private static api: __api__ = __api__functions__;
    private static html: __html__ = __html__functions__;

    public static getExtensionWindow(): SysWindow {
        return Extension.WIN_ExtensionWindow;
    }

    public static async init(mWindow: SysWindow) {
        this.WIN_ExtensionWindow = mWindow;

        if (!Extension.WIN_ExtensionWindow) {
            Log.New().Critical("Extension.init", "Não foi possível carregar a janela principal do plugin pois ela não foi definida.");
        }

        if (!Filesystem.existsSync(this.DIR_ExtensionDirectory)) {
            try {
                Filesystem.mkdirSync(this.DIR_ExtensionDirectory, { recursive: true });
                return;
            } catch (error) {
                new Web(mWindow).New().Error("Extension.init", "Não foi possível criar o diretório de extensões: " + error);
                return;
            }
        };

        const DIR_ExtensionsFolder = Filesystem.readdirSync(this.DIR_ExtensionDirectory);

        await DIR_ExtensionsFolder.forEach(async (pluginFolder) => {
            const pluginPath = Path.join(this.DIR_ExtensionDirectory, pluginFolder);
            const manifestPath = Path.join(pluginPath, "manifest.json");

            if (!Filesystem.existsSync(manifestPath)) {
                new Web(this.WIN_ExtensionWindow).New().Error("Extension.init", `Não foi possível carregar o arquivo "manifest.json" na extensão: ` + pluginFolder);
                return;
            };

            try {
                const Extension_ManifestFile: { name: string; main: string } = JSON.parse(Filesystem.readFileSync(manifestPath, "utf-8"));
                const Extension_initFile = Path.join(pluginPath, Extension_ManifestFile.main || "main.js");

                if (Filesystem.existsSync(Extension_initFile)) {
                    const Plugin: PluginModule = require(Extension_initFile);
                    this.ExtensionsLoaded.push(Extension_ManifestFile.name);

                    if (Plugin && typeof Plugin.init === "function") {
                        try {
                            await Plugin.init(Extension.api, Extension.html);
                            new Web(this.WIN_ExtensionWindow).New().Message("Extension.init", `Plugin carregado: ${Extension_ManifestFile.name}`);
                        } catch (error: unknown) {
                            throw new Error(String(error));
                        }
                    }
                } else {
                    throw new Error(`File ${Extension_ManifestFile.main} could not be found in directory: ${DIR_ExtensionsFolder}`);
                }
            } catch (error: unknown) {
                new Web(this.WIN_ExtensionWindow).New().Error("Extension.init", `Erro ao carregar plugin: ${String(error)}`);
            }
        });
    }
}