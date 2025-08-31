const content = document.getElementById("SETTINGS") as HTMLDivElement;
const settings_button = document.getElementById("Window-titlebar-buttons-settings") as HTMLButtonElement;
const main = document.getElementById("MAIN") as HTMLElement;

settings_button.addEventListener("click", () => {
    console.log("clicked");
    if (content.style.display !== "none") {
        content.style.display = "none";
        main.style.display = "";
    } else {
        content.style.display = "";
        main.style.display = "none";
    }
});

function loadConfig() {
    const tabToolbar = new Toolbar(document.getElementById("Settings-divisions") as HTMLDivElement, document.getElementById("SETTINGS-CONTENT") as HTMLDivElement);
}
