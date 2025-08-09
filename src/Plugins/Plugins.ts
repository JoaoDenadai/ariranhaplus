/*
 *  Plugins.ts
 *  Arquivo que carrega e executa as funções de algum plugin.
 */

/*
 *  Importando bibliotecas
 */
import { Path, Filesystem } from "../Libraries/Libraries";
import SysWindow from "../Modules/Core/Window/Window";
import { Log, Web } from "../Modules/Core/Logs/Logs";
import { Dirent } from "fs";
import * as acorn from 'acorn';

interface getPluginState {
    plugin: string | undefined,
    version: string | undefined,
    folder: string,
    loaded: boolean,
    module: PluginData | undefined
}

const GLOBAL_Security_openModules = ['path', 'url'];


export default class Plugin {
    private pluginsDir = Path.join(__dirname, "../", "../", "plugin");
    private pluginsMap = new Map<string, PluginData>();
    private loadedPluginsSuccessfully: string[] = [];
    private Parent: SysWindow;

    constructor(mWindow: SysWindow) {
        const Logger = new Web(mWindow);
        Logger.New().Message("Plugin.pluginGuardian", `Lista de módulos liberados para uso em plugins: {${GLOBAL_Security_openModules}}.`);
        this.Parent = mWindow;
        this.getPlugins();
        this.runPlugins();
        Logger.New().Message("Plugin.runPlugins", "Plugins carregados: " + Array.from(this.pluginsMap.keys()));
    }

    public pluginModulesArray: getPluginState[] = [];


    public pluginGuardian(pluginPath: string, freeModules: string[]) {
        const Logger = new Web(this.Parent);
        const pluginCode = Filesystem.readFileSync(pluginPath, 'utf-8');
        const ast: acorn.Program = acorn.parse(pluginCode, { sourceType: 'module', ecmaVersion: 'latest' });

        const importsEncontrados = new Set<string>();

        for (const node of ast.body) {
            if (node.type === "ImportDeclaration") {
                const importNode = node as acorn.ImportDeclaration;
                if (typeof importNode.source.value === 'string') {
                    importsEncontrados.add(importNode.source.value);
                } else {
                    Logger.New().Error("Plugin.pluginGuardian", "Não foi possível importar dados do Plugin");
                    throw new Error("Não foi possível importar dados do Plugin");
                }
            }
            if (node.type === "VariableDeclaration") {
                for (const decl of node.declarations) {
                    if (decl.init && decl.init.type === "CallExpression" && decl.init.callee.type === "Identifier" && decl.init.callee.name === "require") {
                        const arg = decl.init.arguments[0];
                        if (arg && arg.type === "Literal" && typeof arg.value === "string") {
                            importsEncontrados.add(arg.value);
                        }
                    }
                }
            }
            if (node.type === "ExpressionStatement" && node.expression.type === "CallExpression" && node.expression.callee.type === "Identifier" && node.expression.callee.name === "require") {
                const arg = node.expression.arguments[0];
                if (arg && arg.type === "Literal" && typeof arg.value === "string") {
                    importsEncontrados.add(arg.value);
                }
            }
        }

        for (const imp of importsEncontrados) {
            if (!freeModules.includes(imp)) {
                Logger.New().Error("Plugin.pluginGuardian", `Uso proibido de módulos por plugins: ${imp}.`);
                throw new Error("Não foi possível importar dados do Plugin.");
            }
        }
    }

    public getPlugins(): void {
        const Logger = new Web(this.Parent);
        if (!Filesystem.existsSync(this.pluginsDir)) {
            Logger.New().Error("Plugins.getPlugins", "Não foi possível encontrar a pasta de plugins, certifique-se de que o diretório está correto.");
            return;
        }
        const pluginFolders = Filesystem.readdirSync(this.pluginsDir, { withFileTypes: true }).filter((Directory: Dirent<string>) => Directory.isDirectory()).map((Diret: any) => Diret.name);

        for (const folder of pluginFolders) {
            const pluginPath = Path.join(this.pluginsDir, folder, 'index.js');

            if (Filesystem.existsSync(pluginPath)) {
                try {
                    this.pluginGuardian(pluginPath, GLOBAL_Security_openModules);

                    const pluginModule = require(pluginPath) as PluginData;
                    this.pluginsMap.set(folder, pluginModule);

                    this.pluginModulesArray.push({ plugin: pluginModule.name, version: pluginModule.version, folder: folder, loaded: true, module: pluginModule });

                    Logger.New().Message("Plugin.getPlugins", `O plugin foi carregado: ${pluginModule.name} (${pluginModule.version})`);
                } catch (error: unknown) {
                    Logger.New().Error("Plugin.getPlugins", "Erro ao carregar plugin: " + error);
                    this.pluginModulesArray.push({ plugin: undefined, version: undefined, folder: folder, loaded: false, module: undefined });
                }
            } else {
                this.pluginModulesArray.push({ plugin: undefined, version: undefined, folder: folder, loaded: false, module: undefined });
                Logger.New().Warning("Plugin.getPlugins", `Arquivo "index.js" não foi encontrado ou está incompatível (Diretório: ${folder})`);
            }
        }
    }

    public runPlugins(): void {
        const Logger = new Web(this.Parent);

        const api = {
            getHtmlFile: (filePath: string) => {
                const fs = require("fs");
                return fs.readFileSync(filePath, "utf8");
            },
        };

        this.pluginModulesArray.forEach((Key: getPluginState) => {
            if (!Key.loaded || !Key.module) return;
            try {
                if (typeof Key.module.init === "function") {
                    Key.module.init(api);
                }
                this.loadedPluginsSuccessfully.push(Key.plugin as string);
                this.Parent.webContents.send("Plugins: Css (init)", (Key.module.css()));
            } catch (error: unknown) {
                Logger.New().Error("Plugin.runPlugins", `Erro ao executar plugin ${Key.plugin}: ${error}`);
            }
        });
    }

}