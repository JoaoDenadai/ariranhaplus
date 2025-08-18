const CONTENT_container = document.getElementById("SETTINGS_Content-Container") as HTMLElement;
const MENU_container = document.getElementById("SETTINGS_Select-type") as HTMLElement;

document.addEventListener("DOMContentLoaded", () => {
    const elements = Array.from(CONTENT_container.children) as HTMLElement[];
    elements.forEach((el) => {
        if (!el) return;
        el.style.display = "none";
    });

    const menu = Array.from(MENU_container.children) as HTMLElement[];
    menu.forEach((men) => {
        if (!men) return;
        men.addEventListener("click", () => {
            elements.forEach((el) => {
                if (!el) return;
                el.style.display = "none";
            });
            (document.querySelector(`[data-settings-screen="${men.dataset.settings}"]`) as HTMLElement).style.display = "";
        });
    });
});