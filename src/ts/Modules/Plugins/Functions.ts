import * as cheerio from "cheerio";
import { Filesystem, Path, Project, System } from "../../Libraries/Libraries";
import { SQL } from "./Query";
import SysWindow from "../Core/Window/Window";
import { Extension } from "./Plugins";

export class __api__functions__ {
    static get = {
        version() {
            return Project.version;
        },
    };

    static files = {
        readFile(Filepath: string) {
            return Filesystem.readFileSync((Path.join(System.homedir(), "Ariranha", "Plugins", Filepath)), "utf-8");
        }
    };

    static sql = {
        async query(Keys: { host: string, user: string, password: string, database: string }, Query: string) {
            const base = new SQL(Keys);

            try {
                const response: any = await base.query(Query);

                return response;
            } catch (err) {
                console.error("Erro na consulta:", err);
            } finally {
                await base.close();
            }
        }
    };
}

export class __html__functions__ {
    private static getHtml(): string {
        const html = Filesystem.readFileSync(Path.join(__dirname, "../../../../public/Main.html"), "utf-8");
        const $ = cheerio.load(html);

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

    static insert = {
        inElementId(TargetId: string, html?: string, css?: string, js?: string) {
            __html__functions__.Window = Extension.getExtensionWindow();
            __html__functions__.Window.webContents.send("Plugins: insertContent (load)", TargetId, html, css, js);
        }
    };

    static ariranha = {
        addNewTab(Title: string) {
            __html__functions__.Window = Extension.getExtensionWindow();
            __html__functions__.Window.webContents.send("Plugins: addNewTab (load)", Title);
        }
    };
}