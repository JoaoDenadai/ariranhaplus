const MENU_Configuracoes_opcoes = document.getElementById("MENU_Configuracoes_opcoes") as HTMLDivElement;

const OPTIONS_SREEN: { datatype: string, display: string }[] = [];


document.addEventListener("DOMContentLoaded", function () {
    (MENU_Configuracoes_opcoes.children[0] as HTMLDivElement).style.backgroundColor = "white";

    (MENU_Configuracoes_opcoes.querySelectorAll("div")).forEach((element) => {
        if (element) {
            OPTIONS_SREEN.push({ datatype: element.innerHTML.toUpperCase(), display: element.style.display });
        }
    });

    MENU_Configuracoes_opcoes.addEventListener("click", (Event) => {
        const target = (Event.target) as HTMLDivElement;

        (MENU_Configuracoes_opcoes.querySelectorAll("div")).forEach((element) => {
            if (element) {
                element.style.backgroundColor = "";
            }
        });

        OPTIONS_SREEN.forEach((element) => {
            const el = document.querySelector(`div[data-type="${element.datatype}"]`) as HTMLDivElement;
            if (el) {
                el.style.display = "none";
            }
        });

        target.style.backgroundColor = "white";
        MENU_Configuracoes_opcoes.insertBefore(target, MENU_Configuracoes_opcoes.firstElementChild);

        const index = OPTIONS_SREEN.findIndex(obj => obj.datatype === target.innerText.toUpperCase());

        if (index > 0) {
            const removed = OPTIONS_SREEN.splice(index, 1)[0];
            OPTIONS_SREEN.unshift(removed);
        }

        const el = document.querySelector(`div[data-type="${OPTIONS_SREEN[0].datatype}"]`) as HTMLDivElement;
        el.style.display = OPTIONS_SREEN[0].display;
    });
});