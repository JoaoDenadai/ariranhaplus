
const DIV_Toolbar = document.getElementById("TOOLBAR") as HTMLDivElement;
const DIV_Content = document.getElementById("CONTENT") as HTMLDivElement;
let ChildrensToolbar: HTMLElement[];
let ChildrensContent: HTMLElement[];

interface ToolbarElements {
    title: string,
    toolbarElement: HTMLDivElement,
    contentElementDataset: string
}

class Toolbar {
    public Toolbar_Elements: ToolbarElements[] = [];
    private Toolbar_Container: HTMLDivElement;
    private Content_Container: HTMLElement;

    constructor(toolbar: HTMLDivElement, content: HTMLDivElement) {
        this.Toolbar_Container = toolbar;
        this.Content_Container = content;
    }

    public getDatasetByToolbarElementId(element: HTMLElement) {
        return element.id.split("module: ")[1];
    }

    public getToolbarElementIndex(element: HTMLElement) {
        return this.Toolbar_Elements.findIndex((item) => item.title === element.id);
    }

    public getScreenElement(element: HTMLDivElement) {
        return Array.from(document.querySelectorAll(`[data-screen="${this.getDatasetByToolbarElementId(element)}"]`)) as HTMLElement[];
    }

    public sortToolbarElements(): [] {
        this.Toolbar_Elements.length = 0;
        for (let i = 0; i < this.Toolbar_Container.children.length; i++) {
            const el = this.Toolbar_Container.children[i] as HTMLDivElement;

            this.Toolbar_Elements.push({ title: this.getDatasetByToolbarElementId(el), toolbarElement: el, contentElementDataset: this.getDatasetByToolbarElementId(el) });
        }
        return this.Toolbar_Elements as [];
    }

    public addElementsByStringArray(titles: string[]) {
        titles.forEach((elementTitle) => {
            const element = document.createElement("div");
            const text = document.createTextNode(elementTitle);
            const close = document.createElement("img");
            close.src = "../public/assets/close.png";

            close.classList.add("close");
            element.id = `module: ${elementTitle}`;
            element.appendChild(text);
            element.appendChild(close);
            this.Toolbar_Container.appendChild(element);

            this.Toolbar_Elements.push({ title: elementTitle, toolbarElement: element, contentElementDataset: elementTitle });
            this.addPoolEvents(element);
        });
    }

    public addNewElement(contentDiv: HTMLElement, title: string) {
        contentDiv.dataset.screen = title;
        const newElement = document.createElement("div");
        const text = document.createTextNode(title);
        const close = document.createElement("img");
        close.src = "../public/assets/close.png";

        close.classList.add("close");
        newElement.id = `module: ${title}`;
        newElement.appendChild(text);
        newElement.appendChild(close);
        this.Toolbar_Container.appendChild(newElement);
        this.Content_Container.appendChild(contentDiv);

        console.log("id: ", newElement.id);
        console.log("dataset: ", contentDiv.dataset.screen);

        this.Toolbar_Elements.push({ title: title, toolbarElement: newElement, contentElementDataset: contentDiv.dataset.screen });
        this.addPoolEvents(newElement);
    };

    public selectElementWhenRemoved(actualElement: HTMLElement) {
        let index = this.Toolbar_Elements.findIndex((item) => item.toolbarElement === actualElement);
        if (index === -1 || this.Toolbar_Elements.length <= 1) {
            index = 0;
        };

        (this.getElementsFromToolbar()).forEach((toolbarElement) => {
            if (!toolbarElement) return;
            toolbarElement.style.backgroundColor = "";
        });

        const next = this.Toolbar_Elements[index].toolbarElement;
        next.style.backgroundColor = "white";

        (this.getElementsFromContents()).forEach((contentElement) => {
            if (contentElement.dataset.screen !== next.id.split("module: ")[1]) {
                contentElement.style.display = "none";
            } else {
                contentElement.style.display = "flex";
            }
        });
    }

    public getElementsFromToolbar(): HTMLElement[] {
        return Array.from(this.Toolbar_Container.children).filter((element): element is HTMLElement => element instanceof HTMLElement);
    }

    public getElementsFromContents(): HTMLElement[] {
        return Array.from(this.Content_Container.children).filter((element): element is HTMLElement => element instanceof HTMLElement);
    }

    public removeByTitle(Title: string) {
        const index = this.Toolbar_Elements.findIndex((item) => item.title === Title);
        const childrens = this.getScreenElement(this.Toolbar_Elements[index].toolbarElement);
        console.log(childrens);
        childrens.forEach((el) => {
            el.remove();
        });

        this.Toolbar_Elements[index].toolbarElement.remove();

        this.Toolbar_Elements.splice(index, 1);
    };

    public removeByIndex(index: number) {
        const childrens = this.getScreenElement(this.Toolbar_Elements[index].toolbarElement);
        childrens.forEach((el) => {
            el.remove();
        });
        this.Toolbar_Elements.splice(index, 1);
    }

    public addPoolEvents(element: HTMLElement) {
        ChildrensToolbar = this.getElementsFromToolbar();
        ChildrensContent = this.getElementsFromContents();

        const sort = () => this.sortToolbarElements();

        element.querySelector(".close")?.addEventListener("click", (event) => {
            this.removeByTitle(this.getDatasetByToolbarElementId(element));
            this.selectElementWhenRemoved(element);
            sort();
        });

        element.addEventListener("click", (event) => {
            if ((event.target as HTMLElement).className === "close") return;
            ChildrensToolbar.forEach((toolbarElement) => {
                if (!toolbarElement) return;
                toolbarElement.style.backgroundColor = "";
            });

            element.style.backgroundColor = "white";

            ChildrensContent.forEach((contentElement) => {
                if (contentElement.dataset.screen !== element.id.split("module: ")[1]) {
                    contentElement.style.display = "none";
                } else {
                    contentElement.style.display = "flex";
                }
            });
        });


        element.addEventListener("mousedown", (event: MouseEvent) => {
            if ((event.target as HTMLElement).classList.contains("close")) return;
            let movimentEnabled: boolean = false;

            const cursorPositionX = event.clientX;

            const getLeft = parseInt(element.style.left) || 0;

            element.click();

            function onMouseMove(onMouseMoveEvent: MouseEvent) {
                const movimentCapToMove = 20;
                const delta = onMouseMoveEvent.clientX - cursorPositionX;

                if (delta > movimentCapToMove || delta < movimentCapToMove * -1 || movimentEnabled) {
                    element.style.left = `${getLeft + delta}px`;
                    element.style.zIndex = "2";
                    movimentEnabled = true;
                }
            }

            function onMouseUp(onMouseUpEvent: MouseEvent) {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);

                const siblingsAndElement = Array.from(element.parentElement!.children) as HTMLElement[];

                const elementRect = element.getBoundingClientRect();
                const elementCenter = elementRect.left + elementRect.width / 2;

                const siblings = siblingsAndElement.filter(sib => sib !== element);

                let targetSiblingIndex = -1;
                for (let i = 0; i < siblings.length; i++) {
                    const actualSiblingRect = siblings[i].getBoundingClientRect();
                    const actualSiblingCenter = actualSiblingRect.left + actualSiblingRect.width / 2;

                    if (elementCenter > actualSiblingCenter) {
                        targetSiblingIndex = i;
                    } else {
                        break;
                    }
                }
                if (targetSiblingIndex === -1) {
                    element.parentElement!.prepend(element);
                } else {
                    siblings[targetSiblingIndex].after(element);
                }

                element.style.left = "0px";
                element.style.zIndex = "";
                movimentEnabled = false;

                sort();
            }

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
    }
}

const TOOLBAR_ELEMENTS: string[] = ["Elemento 1", "Elemento 2", "Elemento 3"];

(function main() {
    const ToolbarObj = new Toolbar(DIV_Toolbar, DIV_Content);
    ToolbarObj.addElementsByStringArray(TOOLBAR_ELEMENTS);

    const el = document.createElement("label");
    el.textContent = "Hello World";
    ToolbarObj.addNewElement(el, "Abanova");
    console.log(ToolbarObj.sortToolbarElements());

    document.addEventListener("click", () => {
        if (ToolbarObj.Toolbar_Elements.length === 0) {
            const body = document.getElementsByTagName("body")[0];
            body.style.backgroundColor = "#f1f3f4";
        } else {
            const body = document.getElementsByTagName("body")[0];
            body.style.backgroundColor = "";
        }
    });
})();