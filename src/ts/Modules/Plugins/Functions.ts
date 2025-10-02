import { Filesystem, Path, Project, System, HtmlParser } from "../../Libraries/Libraries";
import SysWindow from "../Core/Window/Window";
import { Extension } from "./Plugins";
import { WriteFileOptions } from "fs";
import { Log } from "../Core/Logs/Logs";
import mysql from "mysql2/promise";

export type PoolData = {
    host: string,
    user: string,
    password: string,
    database: string,
    waitForConnections: boolean,
    connectionLimit: number,
    queueLimit: number;
}

export type ariranhaProcessManager = NodeJS.Signals;

export class __api__functions__ {
    public app = {
        version: (): string => Project.version,
    };

    public node = {
        on: (signal: NodeJS.Signals | "exit" | "beforeExit" | "uncaughtException", callback: (...args: any[]) => any) => {
            process.on(signal, (...args) => {
                callback(...args);
            });
        },
        runtime: {
            platform: () => process.platform,
            arch: () => process.arch,
            uptime: () => process.uptime(),
            osVersion: () => process.getSystemVersion,
        }
    };

    static file(Filepath: string) {
        const filePath = Path.join(System.homedir(), "Ariranha", "Plugins", Filepath);

        return {
            readFileSync(encoding: BufferEncoding = "utf8"): string | undefined {
                try {
                    const fileContent: string = Filesystem.readFileSync(filePath, encoding);
                    return fileContent;
                } catch (err) {
                    Log.New().Error("__api__functions__.files.readFileSync", `Não foi possível ler o arquivo: ${err}`);
                    return undefined;
                };
            },
            async readFile(encoding: BufferEncoding = "utf8"): Promise<string> {
                return new Promise<string>((resolve, reject) => {
                    Filesystem.readFile(filePath, encoding, (err, data) => {
                        if (err) return reject(err);
                        resolve(data);
                    });
                });
            },
            createFileSync(content: string, options: WriteFileOptions): undefined {
                try {
                    Filesystem.writeFileSync(filePath, String(content), options);
                } catch (err) {
                    Log.New().Error("__api__functions__.files.createFile", `Não foi possível criar o arquivo: ${err}`);
                };
                return undefined;
            },
            async createFile(content: string, options: WriteFileOptions): Promise<string> {
                return new Promise<string>((resolve, reject) => {
                    Filesystem.writeFile(filePath, content, options, (err) => {
                        if (err) return reject(err);
                        resolve(filePath);
                    });
                });
            },
            translateSync(fromEncoding: BufferEncoding, toEncoding: BufferEncoding): string | undefined {
                try {
                    const fileData = Filesystem.readFileSync(filePath, { encoding: fromEncoding });
                    return Buffer.from(fileData, fromEncoding).toString(toEncoding);
                } catch (err) {
                    Log.New().Error("__api__functions__.files.createFile", `Não foi possível traduzir o arquivo: ${err}`);
                    return undefined;
                }
            },
            async translate(fromEncoding: BufferEncoding, toEncoding: BufferEncoding) {
                return new Promise<string>((resolve, reject) => {
                    Filesystem.readFile(filePath, { encoding: fromEncoding }, (err, fileData) => {
                        if (err) return reject(err);
                        resolve(Buffer.from(fileData, fromEncoding).toString(toEncoding));
                    });
                });
            }
        };
    };

    static sql() {
        let poolConnection: mysql.Pool | undefined = undefined;

        return {
            pool() {
                return {
                    init(Pool: PoolData): void {
                        if (!poolConnection) {
                            poolConnection = mysql.createPool(Pool);
                        }
                    },
                    async close(): Promise<void> {
                        if (poolConnection) {
                            await poolConnection.end();
                            poolConnection = undefined;
                        }
                    },
                };
            },
            async query(sql: string, params?: any[]): Promise<any> {
                try {
                    if (!poolConnection) throw new Error(`A conexão com a base de dados não foi iniciada. Inicie a conexão e tente novamente.`);
                    const [rows]: any = await poolConnection.query(sql, params);
                    return rows;
                } catch (err) {
                    Log.New().Error(`SQL.query`, "Não foi possível efetuar a consulta via base de dados: " + err as string);
                    return;
                }
            }
        };
    };
}

export class __html__functions__ {
    private static getHtml(): string {
        const html = Filesystem.readFileSync(Path.join(__dirname, "../../../../public/Main.html"), "utf-8");
        const $ = HtmlParser.load(html);

        const mainTag = $("main");

        return mainTag.html() as string;
    }
    private static Window: SysWindow;

    static get = {
        mainContent() {
            return __html__functions__.getHtml();
        }
    };

    static load = {
        Css(css: string) {
            __html__functions__.Window = Extension.getExtensionWindow();
            __html__functions__.Window.webContents.send("Plugins: Css (init)", css);
        },
        Js(js: string) {
            __html__functions__.Window = Extension.getExtensionWindow();
            __html__functions__.Window.webContents.send("Plugins: Js (load)", js);
        },
    };

    private static removeImports(js?: string) {
        if (!js) return js;

        const lines = js.split("\n");
        const result: string[] = [];
        let skipping = false;

        for (const line of lines) {
            if (!skipping && line.includes("import")) {
                skipping = true;
            }

            if (skipping) {
                if (line.includes(";")) skipping = false;
                continue; // pula linha do import
            }

            result.push(line); // mantém linhas normais
        }

        return result.join("\n");
    }

    static insert = {
        inElementId(TargetId: string, html?: string, css?: string, js?: string) {
            const jsCleanCode = __html__functions__.removeImports(js);
            __html__functions__.Window = Extension.getExtensionWindow();
            __html__functions__.Window.webContents.send("Plugins: insertContent (load)", TargetId, html, css, jsCleanCode);
        }
    };

    static ariranha = {
        addNewTab(Title: string) {
            __html__functions__.Window = Extension.getExtensionWindow();
            __html__functions__.Window.webContents.send("Plugins: addNewTab (load)", Title);
        }
    };
}