import { Filesystem, Path, Project, System, HtmlParser, SQL, Pool } from "../../Libraries/Libraries";
import _Window_ from "../Core/Window/Window";
import { Extension } from "./Plugins";
import { WriteFileOptions } from "fs";
import { Log } from "../Core/Logs/Logs";
import Errno from "../Core/Errno/Errno";
import dotenv from "dotenv";
import { ipcMain, IpcMainInvokeEvent } from "electron";

export class __sql__functions__ {
  private poolList: PoolLink[] = [];
  private isVerboseEnabled: boolean;

  public newPoolConnection(options: PoolData): string | undefined {
    try {
      const pool = SQL.createPool(options);
      this.poolList.push({ Data: options, Pool: pool });
      return options.database;
    } catch (err) {
      Log.New().Error("__sql__functions__.newPoolConnection",
        `Não foi possível inicializar uma nova conexão (Pool) com a base de dados ${options.database}. Mensagem: ${Errno.onError(err)}`
      );
    }
    return undefined;
  }

  public async closePoolConnection(databaseName: string): Promise<void> {
    try {
      const poolIndex = this.poolList.findIndex(e => e.Data.database === databaseName);

      if (poolIndex === -1) {
        const databasesList: string[] = this.poolList.map(db => db.Data.database);
        throw new Error(`Nenhum pool encontrado para o banco de dados: "${databaseName}". Lista de banco de dados conectados na instância ${this.constructor.name}: {${databasesList.join(", ")}}.`);
      }

      const poolEntry = this.poolList[poolIndex];

      await poolEntry.Pool.end();

      this.poolList.splice(poolIndex, 1);
    } catch (err) {
      Log.New().Error("__api__functions__.closePoolFunction",
        `Não foi possível fechar a conexão: ${Errno.onError(err)}`);
    }
  }

  public async runNewQuery(database: string, query: string, params?: any[]): Promise<any> {
    try {
      const databaseIndex = this.poolList.findIndex(e => e.Data.database === database);

      if (databaseIndex === -1) {
        const databasesList: string[] = this.poolList.map(db => db.Data.database);
        throw new Error(`Nenhum pool encontrado para o banco de dados: "${database}". Lista de banco de dados conectados na instância${this.constructor.name}: {${databasesList.join(", ")}}.`);
      }

      const PoolEntry = this.poolList[databaseIndex];

      const [rows] = await PoolEntry.Pool.query(query, params);
      return rows;
    } catch (err) {
      Log.New().Error("__api__functions__.runNewQuery", `Não foi possivel executar a query: ${Errno.onError(err)}`);
      return undefined;
    }
  }

  constructor(verbose: boolean = false) {
    this.isVerboseEnabled = verbose;
  }
}

export class __api__functions__ {
  public static app = {
    version: (): string => Project.version,
  };

  public static node = {
    on: (
      signal: NodeJS.Signals | "exit" | "beforeExit" | "uncaughtException",
      callback: (...args: any[]) => any
    ) => {
      process.on(signal, (...args) => {
        callback(...args);
      });
    },
    runtime: {
      platform: () => process.platform,
      arch: () => process.arch,
      uptime: () => process.uptime(),
      osVersion: () => process.getSystemVersion,
    },
  };

  public static env<K extends string, V>(Filepath: string) {
    const filePath = Path.join(
      System.homedir(),
      "Ariranha",
      "Plugins",
      Filepath
    );

    return {
      parse: () => {
        try {
          const envFile = Filesystem.readFileSync(filePath, "utf-8");
          const parse: dotenv.DotenvParseOutput = dotenv.parse(envFile);
          return parse;
        } catch (err) {
          Log.New().Error("__api__functions__.env.parseEnv", `Não foi possível carregar o arquivo .env: ${Errno.onError(err)}`);
          return undefined;
        }
      },
      create: <K extends string, V extends any>(keys: { key: K, value: V }[]) => {
        try {
          const content = keys.map(({ key, value }) => {
            return `${key}="${value}"`;
          }).join("\n");

          Filesystem.writeFileSync(filePath, content, "utf8");
        } catch (err) {
          Log.New().Error("__api__functions__.env.create", `Não foi possível criar o arquivo .env: ${Errno.onError(err)}`);
        }

      }
    };
  }

  public static file(Filepath: string) {
    const filePath = Path.join(
      System.homedir(),
      "Ariranha",
      "Plugins",
      Filepath
    );

    return {
      readFileSync(encoding: BufferEncoding = "utf8"): string | undefined {
        try {
          const fileContent: string = Filesystem.readFileSync(
            filePath,
            encoding
          );
          return fileContent;
        } catch (err) {
          Log.New().Error(
            "__api__functions__.files.readFileSync",
            `Não foi possível ler o arquivo: ${err}`
          );
          return undefined;
        }
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
          Log.New().Error(
            "__api__functions__.files.createFile",
            `Não foi possível criar o arquivo: ${err}`
          );
        }
        return undefined;
      },
      async createFile(
        content: string,
        options: WriteFileOptions
      ): Promise<string> {
        return new Promise<string>((resolve, reject) => {
          Filesystem.writeFile(filePath, content, options, (err) => {
            if (err) return reject(err);
            resolve(filePath);
          });
        });
      },
      translateSync(
        fromEncoding: BufferEncoding,
        toEncoding: BufferEncoding
      ): string | undefined {
        try {
          const fileData = Filesystem.readFileSync(filePath, {
            encoding: fromEncoding,
          });
          return Buffer.from(fileData, fromEncoding).toString(toEncoding);
        } catch (err) {
          Log.New().Error(
            "__api__functions__.files.createFile",
            `Não foi possível traduzir o arquivo: ${err}`
          );
          return undefined;
        }
      },
      async translate(
        fromEncoding: BufferEncoding,
        toEncoding: BufferEncoding
      ) {
        return new Promise<string>((resolve, reject) => {
          Filesystem.readFile(
            filePath,
            { encoding: fromEncoding },
            (err, fileData) => {
              if (err) return reject(err);
              resolve(Buffer.from(fileData, fromEncoding).toString(toEncoding));
            }
          );
        });
      },
    };
  }
}

export class __ambientBridge__functions__ {
  public static server = {
    sendToDom: (channel: string, ...args: any[]) => {
      Extension.getExtensionWindow().webContents.send(channel, ...args);
      Log.New().Message("__ambientBridge__functions__.server.sendToDom", `Enviado ao dom: ${args.join(',')}.`);
    },
    addResponse: (channel: string, fn: (event: IpcMainInvokeEvent, ...args: any[]) => any) => {
      ipcMain.handle(channel, fn);
      Log.New().Message("__ambientBridge__functions__.server.addResponse", `Resposta adicionada ao canal: ${channel}.`);
    }
  };
}

export class __html__functions__ {
  private static getHtml(): string {
    const html = Filesystem.readFileSync(
      Path.join(__dirname, "../../../../public/Main.html"),
      "utf-8"
    );
    const $ = HtmlParser.load(html);

    const mainTag = $("main");

    return mainTag.html() as string;
  }
  private static Window: _Window_;

  static get = {
    mainContent() {
      return __html__functions__.getHtml();
    },
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
      __html__functions__.Window.webContents.send(
        "Plugins: insertContent (load)",
        TargetId,
        html,
        css,
        jsCleanCode
      );
    },
  };

  static ariranha = {
    addNewTab(Title: string) {
      __html__functions__.Window = Extension.getExtensionWindow();
      __html__functions__.Window.webContents.send(
        "Plugins: addNewTab (load)",
        Title
      );
    },
  };
}
