const Button_Container = document.getElementById('toolbar-container') as HTMLDivElement;

(function main() {
    (Button_Container.firstElementChild as HTMLElement).style.backgroundColor = "white";
})();

Button_Container?.addEventListener('click', (event) => {

    const target = event.target as HTMLElement;

    const Clicked = target.closest("div") as HTMLDivElement;
    if (!Clicked) return undefined;
    if (Clicked.id === Button_Container.id) return undefined;

    Array.from(Button_Container.children).forEach((filho) => {
        (filho as HTMLElement).style.backgroundColor = "";
    });

    if (Clicked) {
        Clicked.style.backgroundColor = "white";
    }

    return Clicked;
});