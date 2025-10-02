type CssStylesDeclaration = { [Key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[Key] }
type ContextMenuButtonDeclarationArray = { title: string, onClick: (...args: unknown[]) => unknown }[];
type SubmenuDeclaration = { title: string, elements: ContextMenuButtonDeclarationArray, submenuElement: HTMLElement, elementsContainer: HTMLDivElement };

class PopupMenu {
    private elements: HTMLElement[] = [];
    private menuElement: HTMLElement;
    private defaultFunction: (event: PointerEvent) => void;
    private submenus: SubmenuDeclaration[] = [];

    private setDefaultMenu(event: PointerEvent) {
        event.preventDefault();
        this.menuElement.style.visibility = "hidden";
        this.menuElement.style.display = "block";

        const getBounding = this.menuElement.getBoundingClientRect();

        let left = event.clientX;
        let top = event.clientY;

        if (event.clientX + getBounding.width > window.innerWidth) {
            left = left - ((event.clientX + getBounding.width - window.innerWidth) * 3);
        }
        if (event.clientY + getBounding.height > window.innerHeight) {
            top = top - (event.clientY + getBounding.height - window.innerHeight);
        }

        this.menuElement.style.top = `${top}px`;
        this.menuElement.style.left = `${left}px`;
        this.menuElement.style.visibility = "visible";

    }

    public show() {
        this.elements.forEach((el) => {
            el.removeEventListener("contextmenu", this.defaultFunction);
            el.addEventListener("contextmenu", this.defaultFunction);
        });
    }

    private setDefaultMenuStyle() {
        this.menuElement.style.position = "absolute";
        this.menuElement.style.display = "none";
    }

    private appendMenuInDocument() {
        document.body.appendChild(this.menuElement);
    }

    constructor(element: HTMLElement) {
        this.menuElement = document.createElement("div");
        this.menuElement.classList.add("ContextMenu");
        this.elements.push(element);

        this.defaultFunction = this.setDefaultMenu.bind(this);

        this.setDefaultMenuStyle();
        this.appendMenuInDocument();

        this.show();

        document.body.addEventListener("click", () => {
            this.setDefaultMenuStyle();
        });

        GlobalEvents.add("mousedown", (e) => {
            if (e.button === 2) {
                (e.target as HTMLElement).click();
            }
        });
    }

    addStyle(Style: CssStylesDeclaration) {
        Object.assign(this.menuElement.style, Style);
    }

    addButtons(Buttons: ContextMenuButtonDeclarationArray) {
        Buttons.forEach((Button) => {
            const elementButton = document.createElement("button");
            elementButton.innerText = Button.title;
            elementButton.addEventListener("click", Button.onClick);

            this.menuElement.appendChild(elementButton);
        });

    }

    addSubmenu(title: string) {
        const submenuButton = document.createElement("button");
        const imgElement = document.createElement("img");
        imgElement.src = "./assets/images/next.png";
        submenuButton.textContent = title;
        submenuButton.appendChild(imgElement);
        this.menuElement.appendChild(submenuButton);

        const submenuElementsContainer = document.createElement("div");
        submenuElementsContainer.style.display = "none";
        submenuElementsContainer.classList.add("SubmenuElementsContainer");

        this.menuElement.appendChild(submenuElementsContainer);

        submenuButton.addEventListener("mouseover", (e) => {
            this.submenus.forEach(menu => {
                menu.elementsContainer.style.display = "none";
            });

            submenuElementsContainer.style.display = "block";
            submenuElementsContainer.style.top = `${submenuButton.offsetTop - 1}px`;
        });

        submenuElementsContainer.addEventListener("mouseover", () => {

            submenuElementsContainer.style.display = "block";
        });

        submenuButton.addEventListener("mouseleave", () => {
            submenuElementsContainer.style.display = "none";
        });

        this.submenus.push({ title: title, elements: [], submenuElement: submenuButton, elementsContainer: submenuElementsContainer });
    }

    addButtosnInSubmenu(SubmenuName: string, Buttons: ContextMenuButtonDeclarationArray) {
        const getSubmenu = this.submenus.find(submenu => submenu.title === SubmenuName);
        console.log(getSubmenu);
        if (getSubmenu) {
            Buttons.forEach((btn) => {
                const elementButton = document.createElement("button");
                elementButton.innerText = btn.title;
                elementButton.addEventListener("click", btn.onClick);
                getSubmenu.elementsContainer.appendChild(elementButton);
                getSubmenu.elements?.push(btn);
            });
        }
    }
}