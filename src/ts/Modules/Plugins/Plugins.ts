//
//  Plugins.ts
//  Desenvolvido por @theunhidenprotogen.
//  Arquivo padrão do ariranha utilizado para carregar plugins ou temas.
//

// Importando dependências.
import _Window_ from "../Core/Window/Window";
import { Filesystem, Path, System, Zip } from "../../Libraries/Libraries";
import { Log, Web } from "../Core/Logs/Logs";
import { __ambientBridge__functions__, __api__functions__, __html__functions__, __sql__functions__ } from "./Functions";

//Dependência personalizada vinda diretamente do NodeJS.
import fetch from "node-fetch";

/**
 * @description Plugin update class.
 * This function is static, so you don't need to create instances.
 * @class Update
 */
class Update {
    private static DIR_ExtensionDirectory: string = Path.join(System.homedir(), "Ariranha", "Plugins");

    /**
     *
     *
     * @static
     * @param {string} owner
     * @param {string} repo
     * @param {(string | null)} [token=null]
     * @return {*} 
     * @memberof Update
     */
    public static async getLatestPluginRelease(owner: string, repo: string, token: string | null = null) {
        const headers: any = { "User-Agent": "AriranhaGetPluginRelease" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers });
        if (!response.ok) {
            throw new Error(`Não foi possível acessar o GitHub para verificar atualizações do repositório ${repo}: ${response.status}: ${response.statusText}`);
        }

        const release: any = await response.json();
        const version = release.tag_name.replace(/^v/, "");
        const asset = release.assets.find((a: any) => a.name.endsWith(".zip"));

        return { serverVersion: version, downloadUrl: asset.browser_download_url };
    }

    public static async downloadAndApplyUpdate(url: string, pluginFolderName: string,) {
        const pluginFolder = Path.join(this.DIR_ExtensionDirectory, pluginFolderName);
        const filePath = Path.join(this.DIR_ExtensionDirectory, `${pluginFolderName}.zip`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro ao baixar arquivo: ${res.status} ${res.statusText}`);
        const buffer = await res.arrayBuffer();
        Filesystem.writeFileSync(filePath, Buffer.from(buffer));

        if (Filesystem.existsSync(pluginFolder)) {
            Filesystem.rmSync(pluginFolder, { recursive: true, force: true });
        }

        const zip = new Zip(filePath);
        zip.extractAllToAsync(this.DIR_ExtensionDirectory);

    }

    public static isOnlineVersionHigherThanLocal(localVersion: string, onlineVersion: string) {
        const getLocalVersionArray = localVersion.split(".").map(Number);
        const getOnlineVersionArray = onlineVersion.split(".").map(Number);

        for (let i = 0; i < Math.max(getLocalVersionArray.length, getOnlineVersionArray.length); i++) {
            const local = getLocalVersionArray[i] || 0;
            const online = getOnlineVersionArray[i] || 0;

            if (online > local) return true;   // Online é maior → update disponível
            if (local > online) return false;
        }
        return false;
    }

    public static async seeIfNewVersionIsAvailable(manifestFile: extensionManifestType, pluginFolderName: string, owner: string, repo: string, token: string | null = null) {
        const getVersionData = this.getLatestPluginRelease(owner, repo, token);
        if (this.isOnlineVersionHigherThanLocal(manifestFile.version, (await getVersionData).serverVersion)) {
            console.log("Update disponível");
            this.downloadAndApplyUpdate((await getVersionData).downloadUrl, pluginFolderName);
        }
    }
}

/**
 * 
 * @description Default class to handle with extensions and themes.
 * This function is static, so you don't need to create instances.
 * @example Extension.init().then();
 * @export
 * @class Extension
 */
export class Extension {
    private static DIR_ExtensionDirectory: string = Path.join(System.homedir(), "Ariranha", "Plugins");
    private static WIN_ExtensionWindow: _Window_;
    private static ExtensionsLoaded: string[] = [];
    private static EXT_Params = {
        api: __api__functions__,
        html: __html__functions__,
        sql: __sql__functions__,
        ambientBridge: __ambientBridge__functions__

    };

    /**
     *
     * @description Get plugin's main electron-window.
     * @static
     * @return {*}  {_Window_}
     * @memberof Extension
     */
    public static getExtensionWindow(): _Window_ {
        return Extension.WIN_ExtensionWindow;
    }

    /**
     *
     * @description Initialize the class. Requires the main electron-window.
     * @static
     * @param {_Window_} mWindow
     * @return {*} 
     * @memberof Extension
     */
    public static async init(mWindow: _Window_): Promise<void> {
        // Lock the main window into a private variable.
        // Once loaded, isn't possible to change the window without reloading.
        this.WIN_ExtensionWindow = mWindow;

        // If extension window is undefined, this will throw critical error.
        if (!Extension.WIN_ExtensionWindow) {
            Log.New().Critical("Extension.init", "Não foi possível carregar a janela principal do plugin pois ela não foi definida.");
        }

        // Verify if plugins directory exists.
        // If it don't exists, just create the folder again.
        if (!Filesystem.existsSync(this.DIR_ExtensionDirectory)) {
            try {
                Filesystem.mkdirSync(this.DIR_ExtensionDirectory, { recursive: true });
                return;
            } catch (error) {
                new Web(mWindow).New().Error("Extension.init", "Não foi possível criar o diretório de extensões: " + error);
                return;
            }
        };

        // Get plugin directory.
        const DIR_ExtensionsFolder = Filesystem.readdirSync(this.DIR_ExtensionDirectory);

        // For each folder finded in plugins, he will load the plugin files.
        for (const pluginFolder of DIR_ExtensionsFolder) {
            // Get plugin path.
            // Will be something like "Ariranha/Plugins/${pluginFolder}".
            const pluginPath = Path.join(this.DIR_ExtensionDirectory, pluginFolder);
            // Get manifest.json file in plugin path.
            const manifestPath = Path.join(pluginPath, "manifest.json");

            // If the manifest path doesn't exists, throw an error.
            if (!Filesystem.existsSync(manifestPath)) {
                new Web(this.WIN_ExtensionWindow).New().Error("Extension.init", `Não foi possível carregar o arquivo "manifest.json" na extensão: ` + pluginFolder);
                return;
            };

            try {
                // Get the plugin's manifest file.
                const Extension_ManifestFile: extensionManifestType = JSON.parse(Filesystem.readFileSync(manifestPath, "utf-8"));

                // Call static Update class to check for new plugin versions. 
                try {
                    await Update.seeIfNewVersionIsAvailable(Extension_ManifestFile, pluginFolder, Extension_ManifestFile.updates.owner, Extension_ManifestFile.updates.repo, Extension_ManifestFile.updates.token);
                } catch (error) {
                    console.error(error);
                }

                // Get plugin main entry point. 
                const Extension_initFile = Path.join(pluginPath, Extension_ManifestFile.main || "main.js");

                // Import plugin if init file exists.
                if (Filesystem.existsSync(Extension_initFile)) {
                    const Plugin: PluginModule = require(Extension_initFile);

                    // Add plugin name at loaded plugins list.
                    this.ExtensionsLoaded.push(Extension_ManifestFile.name);

                    // Load plugin main function if plugin exists and plugin.init is a function.
                    if (Plugin && typeof Plugin.init === "function") {
                        try {
                            // Run plugin.init.
                            await Plugin.init(Extension.EXT_Params.api,
                                Extension.EXT_Params.html,
                                Extension.EXT_Params.sql,
                                Extension.EXT_Params.ambientBridge);

                            new Web(this.WIN_ExtensionWindow).New().Message("Extension.init", `Plugin carregado: ${Extension_ManifestFile.name}`);
                        } catch (error: unknown) {
                            throw new Error(String(error));
                        }
                    }
                } else {
                    throw new Error(`File ${Extension_ManifestFile.main} could not be found in directory: ${DIR_ExtensionsFolder}`);
                }
            } catch (error: unknown) {
                Log.New().Critical("Extension.init", `Erro ao carregar plugin: ${String(error)}`);
            }
        }
    }
}
