export { };

declare global {
    /*
    interface __api__ {
        getVersion(): string;
        readFile(path: string): string;
        sql(Keys: { host: string, user: string, password: string, database: string }, Query: string): Promise<any>;
    }
    */

    interface __api__ {
        get: {
            version(): string,
        }
        files: {
            readFile(path: string): string,
        }
        sql: {
            query(Keys: { host: string, user: string, password: string, database: string }, Query: string): Promise<any>
        }
    }

    /*
    interface __html__ {
        getMainContent(): string;
        loadCssContent(Css: string): void;
        loadScriptContent(Js: string): void;
        addNewTab(Title: string): void;
        insertContentInElementId(TargetId: string, html: string, css: string, js: string): void;
    }
    */

    interface __html__ {
        get: {
            mainContent(): string,
        },
        load: {
            Css(Css: string): void,
            Js(Js: string): void,
        }
        insert: {
            inElementId(TargetId: string, html?: string, css?: string, js?: string): void;
        }
        ariranha: {
            addNewTab(Title: string): void;
        }
    }

    interface PluginModule {
        init?: (api: __api__, html: __html__) => void;
    }
}