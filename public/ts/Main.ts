const mainToolbar = new Toolbar(DIV_Toolbar, DIV_Content);


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
        mainToolbar.addElementsByStringArray([Title]);
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

document.addEventListener("DOMContentLoaded", () => {
    initWindowResponseProcess();
});