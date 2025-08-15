import * as cheerio from "cheerio";
import { Filesystem, Path, Project } from "../../Libraries/Libraries";
import { Log } from "../Core/Logs/Logs";
import SysWindow from "../Core/Window/Window";
import * as os from "os";


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

export class PluginRuntime {
    private static pluginsDir: string = Path.join(os.homedir(), "Ariranha Plus", "Plugins");
    private static parentWindow: SysWindow;
    private static api: __api__ = {
        getVersion() { return Project.version; },
        readFile(path: string) {
            return Filesystem.readFileSync(Path.join(PluginRuntime.pluginsDir, path), "utf-8");
        },
    };

    private static html: __html__ = {
        getMainContent(): string {
            return getHtml();
        },
        loadCssContent(Css: string): void {
            PluginRuntime.parentWindow.webContents.send("Plugins: Css (init)", Css);
        },
        loadScriptContent(Js: string): void {
            PluginRuntime.parentWindow.webContents.send("Plugins: Js (load)", Js);
        },
        addNewTab(Title: string): void {
            PluginRuntime.parentWindow.webContents.send("Plugins: addNewTab (load)", Title);
        },
        insertContentInElementId(Targetid, html, css, js) {
            PluginRuntime.parentWindow.webContents.send("Plugins: insertContent (load)", Targetid, html, css, js);
        }
    };

    public static load(parent: SysWindow) {
        this.parentWindow = parent;
        if (!Filesystem.existsSync(this.pluginsDir)) {
            Filesystem.mkdirSync(this.pluginsDir, { recursive: true });
            console.log("Diretório inexistente. Criando diretório: ", this.pluginsDir);
            return;
        };

        const pluginFolders = Filesystem.readdirSync(this.pluginsDir);

        for (const folder of pluginFolders) {
            const pluginPath = Path.join(this.pluginsDir, folder);
            const manifestPath = Path.join(pluginPath, "manifest.json");

            if (!Filesystem.existsSync(manifestPath)) continue;

            try {
                const manifest: { name: string; main?: string } = JSON.parse(Filesystem.readFileSync(manifestPath, "utf-8"));

                const mainFile = Path.join(pluginPath, manifest.main || "main.js");

                if (Filesystem.existsSync(mainFile)) {
                    const pluginModule: PluginModule = require(mainFile);

                    if (pluginModule && typeof pluginModule.init === "function") {
                        try {
                            pluginModule.init(PluginRuntime.api, PluginRuntime.html);
                            Log.New().Message("PluginRuntime.load", `Plugin carregado: ${manifest.name}`);
                        } catch (error: unknown) {
                            Log.New().Error("PluginRuntime.load", `O plugin foi carregado, porém, apresenta o seguinte erro: ${error}`);
                        }

                    }
                }
            } catch (error: unknown) {
                Log.New().Error("PluginRuntime.load", `Erro ao carregar plugin: ${error}`);
            }
        }
    }
}