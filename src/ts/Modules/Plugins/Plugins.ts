import { Filesystem, Path } from "../../Libraries/Libraries";
import { Log } from "../Core/Logs/Logs";

// Define a interface da API que será exposta aos plugins
export interface __api__ {
    getVersion(): string;
}

// Tipagem do módulo do plugin
export interface PluginModule {
    init?: (api: __api__) => void;
    [key: string]: any;
}

export class PluginRuntime {
    private pluginsDir: string;

    constructor() {
        this.pluginsDir = Path.join(__dirname, "../../../../plugins");
    }

    load(api: __api__) {
        if (!Filesystem.existsSync(this.pluginsDir)) {
            console.log("Diretório inexistente: ", this.pluginsDir);
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
                            pluginModule.init(api);
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