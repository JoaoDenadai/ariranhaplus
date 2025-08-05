
const Div_Container = document.getElementById("CONTENT") as HTMLDivElement;
const DIV_Formatar = document.getElementById("toolbar-formatar") as HTMLDivElement;
const DIV_Configurar = document.getElementById("toolbar-settings") as HTMLDivElement;

document.addEventListener("DOMContentLoaded", function () {
    const Screens = Array.from(Div_Container.children).filter((element): element is HTMLDivElement => element.tagName === "DIV");
    Screens[1].style.display = "none";

    DIV_Formatar.addEventListener("click", () => {
        Screens.forEach((element) => {
            if (element) {
                element.style.display = "none";
            }
        });
        Screens[0].style.display = "";
    });


    DIV_Configurar.addEventListener("click", () => {
        Screens.forEach((element) => {
            if (element) {
                element.style.display = "none";
            }
        });
        Screens[1].style.display = "";
    });
});
