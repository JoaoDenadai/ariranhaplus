const DIV_Toolbar = document.getElementById("TOOLBAR") as HTMLDivElement;
const DIV_Content = document.getElementById("CONTENT") as HTMLDivElement;
const toolbar_el = new Toolbar(DIV_Toolbar, DIV_Content);
const tooltip_el = new Tooltip();

function initWindowResponseProcess() {
    window.WebContent.Log((msg, type) => {
        switch (type) {
            case "Error": {
                console.error(msg);
                break;
            }
            case "Message": {
                console.log(msg);
                break;
            }
            case "Warning": {
                console.warn(msg);
                break;
            }
        }
    });

    window.Plugins_.initCss((Css: string) => {
        const fromPlugin = document.createElement('style');
        fromPlugin.textContent = Css;
        document.head.appendChild(fromPlugin);
        console.log(Css);
    });

    window.Plugins_.initJs((Js: string) => {
        const script = document.createElement("script");
        script.textContent = Js;
        document.body.appendChild(script);
    });

    window.Plugins_.addNewTab((Title: string) => {
        toolbar_el.addElementsByStringArray([Title]);
    });

    window.Plugins_.insertContentInElementId((targetId, html, css, js) => {
        const el = document.getElementById(targetId);
        if (!el) return;

        el.insertAdjacentHTML("beforeend", html);

        if (css) {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        }

        if (js) {
            const script = document.createElement("script");
            script.textContent = js;
            document.body.appendChild(script);
        }
    });
};

async function awaitLoading<T>(Function: () => Promise<T>) {
    const Loader = document.getElementById("loader") as HTMLElement;
    if (!Loader) return await Function();

    void Loader.offsetWidth;
    Loader.style.animation = "slide 1s ease-in-out infinite";

    try {
        return await Function();
    } finally {
        Loader.style.animation = "none";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initWindowResponseProcess();
    initWindowEvents();
    toolbar_el.make.PoolEvents.new(dragAndDropPoolevent);

    Thread.New(async () => {
        const get = async () => {
            try {
                const response = await fetch("https://www.google.com/generate_204", { method: "GET", cache: "no-store", });
                if (response.status === 204) {
                    return true;
                } else {
                    return false;
                }
            } catch (err) {
                return false;
            }
        };

        if (await get()) {
            (document.getElementById("internet_connection") as HTMLImageElement).style.opacity = "0.75";
            ((document.getElementById("internet_connection") as HTMLImageElement).parentElement as HTMLElement).dataset.tooltip = "title: Conectado a internet\nSua máquina está conectada à internet.\ndescription: Fornecido por Google";
        } else {
            (document.getElementById("internet_connection") as HTMLImageElement).style.opacity = "";
            ((document.getElementById("internet_connection") as HTMLImageElement).parentElement as HTMLElement).dataset.tooltip = "title: Sem conexão com a internet\nSua máquina não está conectada à internet.\ndescription: Fornecido por Google";
        }
    }, 10000);

    Thread.New(() => {
        const num_threads = Thread.running;
        (document.getElementById("threads_process") as HTMLImageElement).style.opacity = "1";
        (document.getElementById("thread_count") as HTMLLabelElement).textContent = String(num_threads);
    }, 500);

    Thread.New(async () => {
        const totalMb = await window.ariranha_.getMemoryUsage();
        (document.getElementById("memory_use") as HTMLLabelElement).textContent = `${Math.round(totalMb).toString()} MB`;
    }, 500);

    toolbar_el.addElementsByStringArray(["Teste1", "Teste2", "Teste3"]);
    toolbar_el.make.PoolEvents.run();
    console.log(toolbar_el.Toolbar_Elements);

    (document.getElementById("SETTINGS") as HTMLElement).style.display = "none";
    loadConfig();
});