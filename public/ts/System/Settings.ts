const content = document.getElementById("SETTINGS") as HTMLDivElement;
const settings_content = document.getElementById("SETTINGS-CONTENT") as HTMLDivElement;
const settings_button = document.getElementById("Window-titlebar-buttons-settings") as HTMLButtonElement;
const settings_container = document.getElementById("Settings-divisions") as HTMLButtonElement;
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

interface SettingsElements {
    title: string,
    SettingElement: HTMLDivElement,
    dataset: string
}

class Settings {
    public settings_container: HTMLElement;
    public settings_content_container: HTMLElement;

    public SettingElements: SettingsElements[] = [];

    constructor(Settings_container: HTMLElement, Settings_content_container: HTMLElement) {
        this.settings_container = Settings_container;
        this.settings_content_container = Settings_content_container;

        const preload_elements = Array.from(Settings_container.children) as HTMLDivElement[];
        preload_elements.forEach((el) => {
            this.SettingElements.push({ title: el.id, SettingElement: el, dataset: el.id });
        });
        this.unselectAll();

        this.SettingElements[0].SettingElement.style.backgroundColor = "white";
        const childrens = Array.from(document.querySelectorAll<HTMLElement>(`[data-settings-screen="${this.SettingElements[0].SettingElement.id}"]`));
        childrens.forEach((children) => {
            children.style.display = "";
        });

        this.addPoolEvents();
    }

    private unselectAll() {
        this.SettingElements.forEach((el) => {
            el.SettingElement.style.backgroundColor = "";
            const childrens = Array.from(document.querySelectorAll<HTMLElement>(`[data-settings-screen="${el.dataset}"]`));
            childrens.forEach((children) => {
                children.style.display = "none";
            });
        });
    }

    private addPoolEvents() {
        this.SettingElements.forEach((el) => {
            el.SettingElement.addEventListener("mousedown", () => {
                this.unselectAll();
                el.SettingElement.style.backgroundColor = "white";
                const childrens = Array.from(document.querySelectorAll<HTMLElement>(`[data-settings-screen="${el.dataset}"]`));
                childrens.forEach((children) => {
                    children.style.display = "";
                });
            });
        });
    }
}

function loadConfig() {
    new Settings(settings_container, settings_content);
}
