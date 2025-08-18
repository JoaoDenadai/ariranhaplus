const GLOBAL_CloseButton_main = document.getElementById('Window-titlebar-buttons-close') as HTMLButtonElement;
const GLOBAL_MinimizeButton_main = document.getElementById('Window-titlebar-buttons-minimize') as HTMLButtonElement;
const GLOBAL_SettingsScreen = document.getElementById('SETTINGS') as HTMLButtonElement;
const GLOBAL_SettingsButton_main = document.getElementById('Window-titlebar-buttons-settings') as HTMLButtonElement;
const GLOBAL_label_main = document.getElementById('Window-titlebar-titlelabel') as HTMLLabelElement;
let GLOBAL_ElementSettingScreen_Instance: HTMLElement;

GLOBAL_CloseButton_main.addEventListener('click', async () => {
    const result = await window.ariranha_.Popup("Deseja mesmo fechar a janela?", "Confirm", "Deseja fechar a janela?", "Confirme se deja fechar a janela", false);
    if (result) window.ariranha_.Action("Close");
});

GLOBAL_MinimizeButton_main.addEventListener('click', () => {
    window.ariranha_.Action("minimize");
});

window.ariranha_.Application("Application").then(Response => {
    GLOBAL_label_main.textContent = `Ariranha Plus | Versão: ${Response.version} | Beta`;
});

GLOBAL_SettingsButton_main.addEventListener("click", () => {
    const el = mainToolbar.getElementsFromToolbar().filter(el => el.id === "Ariranha_PluginModule_Opções");
    if (el.length === 1) return;
    GLOBAL_ElementSettingScreen_Instance = mainToolbar.addNewElement(GLOBAL_SettingsScreen, "Opções");
});