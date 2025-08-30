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
             *  Aplica um push ao elemnto @this.Toolbar_Elements, incluindo os elementos já existentes na variável.
             */
            this.Toolbar_Elements.push({ title: children.id ?? undefined, toolbarElement: children as HTMLDivElement, contentElementDataset: "Add" });

            /**
             * Não adicionar mais os comportamentos de cada elemento via construtor
             * @deprecated
             */
            this.addPoolEvents(children);
        });
    }

    /**
     * 
     * @param element
     * Elemento da barra de abas.
     * @returns 
     * Retorna uma string com o Dataset correspondente do elemento de conteúdo.
     */
    public getDatasetByToolbarElementId(element: HTMLElement): string {
        return element.id.split(this.ToolbarElement_id_base)[1];
    }

    /**
     * @param element 
     * Elemento da barra de abas.
     * @returns 
     * Retorna a lista de elementos relacionados a aba passada via argumento.
     */
    public getScreenElementByToolbarElement(element: HTMLDivElement) {
        return Array.from(document.querySelectorAll(`[data-screen="${this.getDatasetByToolbarElementId(element)}"]`)) as HTMLElement[];
    }

    /**
     * Função que organiza os elementos da barra de tarefas.
     * Útil caso, visualmente, um elemento seja alterado via HTML e que seja necessário alterar a ordem na lista de elementos.
     * @returns 
     * Retorna a lista de elementos reordenada.
     */
    public sortToolbarElements(): [] {
        /* Limpa o conteúdo dos elementos.
         */
        this.Toolbar_Elements.length = 0;

        /* Para cada elemento filho da barra de abas...
         */
        for (let i = 0; i < this.Toolbar_Container.children.length; i++) {
            /* ...pega o elemento...
             */
            const el = this.Toolbar_Container.children[i] as HTMLDivElement;

            /* ...e inclui na ordem atual cada elemento filho pertencente a barra de abas.
             */
            this.Toolbar_Elements.push({ title: this.getDatasetByToolbarElementId(el), toolbarElement: el, contentElementDataset: this.getDatasetByToolbarElementId(el) });
        }
        return this.Toolbar_Elements as [];
    }

    public selectElementByTitle(title: string): void {
        this.Toolbar_Elements.forEach((el) => {
            console.log(`el: ${el}; title: ${title}`);
            if (el.title === title) {
                el.toolbarElement.style.backgroundColor = "white";
                (document.querySelector(`[data-screen="${el.contentElementDataset}"]`) as HTMLElement).style.display = "";
            } else {
                el.toolbarElement.style.backgroundColor = "";
                (document.querySelector(`[data-screen="${el.contentElementDataset}"]`) as HTMLElement).style.display = "none";
            }
        });
    }

    /**
     * Função que adiciona vários elementos apenas através de um (ou mais) título.
     * @param titles 
     * Um array de string com o título das abas.
     */
    public addElementsByStringArray(titles: string[]) {
        // Para cada título...
        titles.forEach((elementTitle) => {
            let uniqueTitle = elementTitle;
            let counter = 1;

            while (this.Toolbar_Elements.some(el => el.title === uniqueTitle)) {
                uniqueTitle = `${elementTitle}_${counter}`;
                counter++;
            }

            //...tenta importar o elemento de conteúdo...
            const divElement = this.Content_Container.querySelector(`div[data-screen="${uniqueTitle}"]`);

            // Verifica se o elemento de conteúdo existe, senão...
            if (!divElement) {
                // Cria um novo elemento de conteúdo, altera seu dataset-screen para o título passado...
                const newContent = document.createElement("div");
                newContent.dataset.screen = uniqueTitle;

                //... e vincula o conteúdo no container de conteúdos.
                this.Content_Container.appendChild(newContent);
            }

            // Cria uma nova aba...
            const newTab = document.createElement("div");
            // ...inclui o título...
            const text = document.createTextNode(uniqueTitle);
            // ...adiciona o botão de fechar e passa o Path da imagem...
            const close = document.createElement("img");
            close.src = "./assets/images/close.png";
            close.classList.add("close");

            // Adiciona um novo Id ao elemento da aba.
            newTab.id = `Ariranha_PluginModule_${uniqueTitle}`;
            // Adiciona o título e a imagem de fechar aba.
            newTab.appendChild(text);
            newTab.appendChild(close);

            // Adiciona a nova aba criada ao container das abas.
            this.Toolbar_Container.appendChild(newTab);

            // Inclui a aba na lista de abas.
            this.Toolbar_Elements.push({ title: uniqueTitle, toolbarElement: newTab, contentElementDataset: uniqueTitle });

            // Se for o primeiro elemento adicionado, pinta seu fundo de branco.
            if (this.Toolbar_Elements.length === 1) {
                this.selectElementByTitle(uniqueTitle);
            }

            // Adiciona os eventos do botão.
            this.addPoolEvents(newTab);
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
        const childrens = this.getScreenElementByToolbarElement(this.Toolbar_Elements[index].toolbarElement);
        console.log(childrens);
        childrens.forEach((el) => {
            el.remove();
        });

        this.Toolbar_Elements[index].toolbarElement.remove();

        this.Toolbar_Elements.splice(index, 1);
    };

    public removeByIndex(index: number) {
        const childrens = this.getScreenElementByToolbarElement(this.Toolbar_Elements[index].toolbarElement);
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

