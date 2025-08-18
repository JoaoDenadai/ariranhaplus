import * as cheerio from "cheerio";
import { Filesystem, Path, Project, System } from "../../Libraries/Libraries";
import { Log, Web } from "../Core/Logs/Logs";
import SysWindow from "../Core/Window/Window";


// Define a interface da API que será exposta aos plugins
export interface __api__ {
    getVersion(): string;
    readFile(path: string): string
}

export interface __html__ {
    getMainContent(): string;
    loadCssContent(Css: string): void;
    loadScriptContent(Js: string): void;
    addNewTab(Title: string): void;
    insertContentInElementId(TargetId: string, html: string, css: string, js: string): void;
}

function getHtml(): string {
    const html = Filesystem.readFileSync(Path.join(__dirname, "../../../../public/Main.html"), "utf-8");
    const $ = cheerio.load(html);

    const mainTag = $("main");

    return mainTag.html() as string;
}

export interface PluginModule {
    init?: (api: __api__, html: __html__) => void;
}

export class Extension {
    private static DIR_ExtensionDirectory: string = Path.join(System.homedir(), "Ariranha Plus", "Plugins");
    private static WIN_ExtensionWindow: SysWindow;
    private static api: __api__ = {
        getVersion() { return Project.version; },
        readFile(path: string) {
            return Filesystem.readFileSync(Path.join(Extension.DIR_ExtensionDirectory, path), "utf-8");
        },
    };

    private static html: __html__ = {
        getMainContent(): string {
            return getHtml();
        },
        loadCssContent(Css: string): void {
            Extension.WIN_ExtensionWindow.webContents.send("Plugins: Css (init)", Css);
        },
        loadScriptContent(Js: string): void {
            Extension.WIN_ExtensionWindow.webContents.send("Plugins: Js (load)", Js);
        },
        addNewTab(Title: string): void {
            Extension.WIN_ExtensionWindow.webContents.send("Plugins: addNewTab (load)", Title);
        },
        insertContentInElementId(Targetid, html, css, js) {
            Extension.WIN_ExtensionWindow.webContents.send("Plugins: insertContent (load)", Targetid, html, css, js);
        }
    };

    public static init(mWindow: SysWindow) {
        this.WIN_ExtensionWindow = mWindow;

        if (!Extension.WIN_ExtensionWindow) {
            Log.New().Critical("Extension.init", "Não foi possível carregar a janela principal do plugin pois ela não foi definida.");
        }

        if (!Filesystem.existsSync(this.DIR_ExtensionDirectory)) {
            try {
                Filesystem.mkdirSync(this.DIR_ExtensionDirectory, { recursive: true });
            } catch (error) {
                new Web(mWindow).New().Error("Extension.init", "Não foi possível criar o diretório de extensões: " + error);
            }
            return;
        };

        const DIR_ExtensionsFolder = Filesystem.readdirSync(this.DIR_ExtensionDirectory);

        DIR_ExtensionsFolder.forEach((pluginFolder) => {
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

                    if (Plugin && typeof Plugin.init === "function") {
                        try {
                            Plugin.init(Extension.api, Extension.html);
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