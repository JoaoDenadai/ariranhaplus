
import { Filesystem, Path, System } from "../../Libraries/Libraries";
import { Log, Web } from "../Core/Logs/Logs";
import SysWindow from "../Core/Window/Window";
import { __api__functions__, __html__functions__ } from "./Functions";
import fetch from "node-fetch";
import AdmZip = require("adm-zip");
import { basename } from "path";


export class Extension {
    private static DIR_ExtensionDirectory: string = Path.join(System.homedir(), "Ariranha", "Plugins");
    private static WIN_ExtensionWindow: SysWindow;
    private static ExtensionsLoaded: string[] = [];
    private static api: __api__ = __api__functions__;
    private static html: __html__ = __html__functions__;

    public static getExtensionWindow(): SysWindow {
        return Extension.WIN_ExtensionWindow;
    }

    private static async getLatestPluginRelease(owner: string, repo: string, token: string | null = null) {
        const headers: any = { "User-Agent": "AriranhaGetPluginRelease" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers });
        if (!response.ok) {
            throw new Error(`Não foi possível acessar o GitHub para verificar atualizações do repositório ${repo}: ${response.status}: ${response.statusText}`);
        }
        console.log(response);

        const release: any = await response.json();
        const version = release.tag_name.replace(/^v/, "");
        const asset = release.assets.find((a: any) => a.name.endsWith(".zip"));

        return { serverVersion: version, downloadUrl: asset.browser_download_url };
    }

    private static async downloadAndApplyUpdate(url: string, pluginFolderName: string) {
        const pluginFolder = Path.join(this.DIR_ExtensionDirectory, pluginFolderName);
        const filePath = Path.join(this.DIR_ExtensionDirectory, `${pluginFolderName}.zip`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro ao baixar arquivo: ${res.status} ${res.statusText}`);
        const buffer = await res.arrayBuffer();
        Filesystem.writeFileSync(filePath, Buffer.from(buffer));

        if (Filesystem.existsSync(pluginFolder)) {
            Filesystem.rmSync(pluginFolder, { recursive: true, force: true });
        }

        const zip = new AdmZip(filePath);
        zip.extractAllToAsync(this.DIR_ExtensionDirectory);

        console.log("Arquivo criado: ", filePath);

    }

    private static isOnlineVersionHigherThanLocal(localVersion: string, onlineVersion: string) {
        const getLocalVersionArray = localVersion.split(".").map(Number);
        const getOnlineVersionArray = onlineVersion.split(".").map(Number);
        console.log("Versão local: ", localVersion, "  |  Versão online: ", onlineVersion);

        for (let i = 0; i < Math.max(getLocalVersionArray.length, getOnlineVersionArray.length); i++) {
            const local = getLocalVersionArray[i] || 0;
            const online = getOnlineVersionArray[i] || 0;

            if (online > local) return true;   // Online é maior → update disponível
            if (local > online) return false;
        }
        return false;
    }

    private static async seeIfNewVersionIsAvailable(manifestFile: extensionManifestType, pluginFolderName: string, owner: string, repo: string, token: string | null = null) {
        const getVersionData = this.getLatestPluginRelease(owner, repo, token);
        if (this.isOnlineVersionHigherThanLocal(manifestFile.version, (await getVersionData).serverVersion)) {
            console.log("Update disponível");
            this.downloadAndApplyUpdate((await getVersionData).downloadUrl, pluginFolderName);
        } else {
            console.log("Nenhuma atualização encontrada");
        }
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
        for (const pluginFolder of DIR_ExtensionsFolder) {
            const pluginPath = Path.join(this.DIR_ExtensionDirectory, pluginFolder);
            const manifestPath = Path.join(pluginPath, "manifest.json");

            if (!Filesystem.existsSync(manifestPath)) {
                new Web(this.WIN_ExtensionWindow).New().Error("Extension.init", `Não foi possível carregar o arquivo "manifest.json" na extensão: ` + pluginFolder);
                return;
            };

            try {
                const Extension_ManifestFile: extensionManifestType = JSON.parse(Filesystem.readFileSync(manifestPath, "utf-8"));

                try {
                    await this.seeIfNewVersionIsAvailable(Extension_ManifestFile, pluginFolder, Extension_ManifestFile.updates.owner, Extension_ManifestFile.updates.repo, Extension_ManifestFile.updates.token);
                } catch (error) {
                    console.error(error);
                }

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
        }
    }
}