interface ToolbarElements {
    title: string | undefined,
    toolbarElement: HTMLDivElement,
    contentElementDataset: string
}

class Toolbar {
    private Toolbar_Container: HTMLDivElement;          //Container da barra de abas
    private Content_Container: HTMLElement;             //Container do conteúdo

    public Toolbar_Elements: ToolbarElements[] = [];    //Elementos da barra de abas
    private ChildrensToolbar: HTMLElement[] = [];       //Elementos filhos (Abas) da barra de abas
    private ChildrensContent: HTMLElement[] = [];

    private ToolbarElement_id_base: string = "Ariranha_PluginModule_";



    /**
     * Construtor que inicializa a instância da barra
     * 
     * @param {HTMLDivElement} toolbar
     * Container pai dos elementos da barra de abas.
     * 
     * @param {HTMLDivElement} content
     * Container pai dos elementos de conteúdo das abas.
     * 
     * @memberof Toolbar
     */
    constructor(toolbar: HTMLDivElement, content: HTMLDivElement) {
        this.Toolbar_Container = toolbar;
        this.Content_Container = content;
        

        /**
         * @param {HTMLElement[]} preload_toolbarElements
         * Variável responsável por importar elementos já existentes no container da barra de abas.
         * Caso já exista um elemento (Tipo uma aba) no momento da construção, ele importa a aba.
         */
        const preload_toolbarElements: HTMLElement[] = Array.from(toolbar.children) as HTMLElement[];
        preload_toolbarElements.forEach((children) => {
            /**
             * @
             * 
             */
            this.Toolbar_Elements.push({ title: children.id ?? undefined, toolbarElement: children as HTMLDivElement, contentElementDataset: "Add" });
            this.addPoolEvents(children);
        });
    }

    public getDatasetByToolbarElementId(element: HTMLElement) {
        return element.id.split(this.ToolbarElement_id_base)[1];
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
            const divElement = this.Content_Container.querySelector(`div[data-screen="${elementTitle}"]`);

            if (!divElement) {
                const newContent = document.createElement("div");
                newContent.dataset.screen = elementTitle;
                this.Content_Container.appendChild(newContent);
            }

            const element = document.createElement("div");
            const text = document.createTextNode(elementTitle);
            const close = document.createElement("img");
            close.src = "./assets/images/close.png";

            close.classList.add("close");
            element.id = `Ariranha_PluginModule_${elementTitle}`;
            element.appendChild(text);
            element.appendChild(close);
            this.Toolbar_Container.appendChild(element);

            if (this.Toolbar_Elements.length === 0) {
                element.style.backgroundColor = "white";
            }
            this.Toolbar_Elements.push({ title: elementTitle, toolbarElement: element, contentElementDataset: elementTitle });
            this.addPoolEvents(element);
        });
    }

    public addNewElement(element: HTMLElement, title: string): HTMLElement {
        element.dataset.screen = title;
        const newElement = document.createElement("div");
        const text = document.createTextNode(title);
        const close = document.createElement("img");
        close.src = "./assets/images/close.png";

        close.classList.add("close");
        newElement.id = `Ariranha_PluginModule_${title}`;
        newElement.appendChild(text);
        newElement.appendChild(close);
        this.Toolbar_Container.appendChild(newElement);
        this.Content_Container.appendChild(element);

        this.Toolbar_Elements.push({ title: title, toolbarElement: newElement, contentElementDataset: element.dataset.screen });
        this.addPoolEvents(newElement);
        element.click();
        return element;
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
            if (contentElement.dataset.screen !== next.id.split(this.ToolbarElement_id_base)[1]) {
                contentElement.style.display = "none";
            } else {
                contentElement.style.display = "";
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
        this.ChildrensToolbar = this.getElementsFromToolbar();
        this.ChildrensContent = this.getElementsFromContents();

        const sort = () => this.sortToolbarElements();

        element.querySelector(".close")?.addEventListener("click", (event) => {
            this.removeByTitle(this.getDatasetByToolbarElementId(element));
            this.selectElementWhenRemoved(element);
            sort();
        });

        element.addEventListener("click", (event) => {
            if ((event.target as HTMLElement).className === "close") return;
            this.ChildrensToolbar.forEach((toolbarElement) => {
                if (!toolbarElement) return;
                toolbarElement.style.backgroundColor = "";
            });

            element.style.backgroundColor = "white";

            this.ChildrensContent.forEach((contentElement) => {
                if (contentElement.dataset.screen !== element.id.split(this.ToolbarElement_id_base)[1]) {
                    contentElement.style.display = "none";
                } else {
                    contentElement.style.display = "";
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

                if (Math.abs(delta) > movimentCapToMove || movimentEnabled) {
                    let newLeft = getLeft + delta;
                    element.style.transition = "";
                    element.style.left = `${newLeft}px`;
                    const WindowRect = element.getBoundingClientRect();

                    if (WindowRect.left < 0) {
                        newLeft = newLeft - WindowRect.left;
                        element.style.left = `${newLeft}px`;
                        movimentEnabled = false;
                    } else {
                        movimentEnabled = true;
                    }
                    element.style.zIndex = "2";
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
                    const actualSibling = siblings[i] as HTMLElement;
                    if (actualSibling.dataset.property?.includes(("Fixed").toLowerCase())) {
                        break;
                    };
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

                requestAnimationFrame(() => {
                    element.style.transition = "left 0.3s ease-out";
                    element.style.left = "0px";
                });

                element.style.zIndex = "";
                movimentEnabled = false;

                sort();
            }

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
    }

    public addCustomPoolEventsCallback(element: HTMLElement, PoolFunction: (el: HTMLElement) => void) {

        const replace = element.cloneNode(true);

        const index = this.Toolbar_Elements.findIndex(item => item.toolbarElement === element);
        if (index !== -1) {
            this.Toolbar_Elements[index].toolbarElement = replace as HTMLDivElement;
        }

        console.log(element);
        element.parentNode?.replaceChild(replace, element);
        console.log(replace);
        PoolFunction(replace as HTMLElement);
    }

    public addCustomPoolEventsCallbackByTitle(title: string, PoolFunction: (el: HTMLElement) => void) {
        const index = this.Toolbar_Elements.findIndex((item) => item.title === title);
        if (index === -1) return;

        const getContent = this.Toolbar_Elements[index].toolbarElement;
        const replace = this.Toolbar_Elements[index].toolbarElement.cloneNode(true);
        this.Toolbar_Elements[index].toolbarElement = replace as HTMLDivElement;
        this.Toolbar_Container.replaceChild(replace, getContent);
        PoolFunction(replace as HTMLElement);
    }
}

