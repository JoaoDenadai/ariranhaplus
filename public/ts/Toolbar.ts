interface ToolbarElements {
    title: string | undefined,
    toolbarElement: HTMLDivElement,
    contentElementDataset: string,
    poolEvents?: ((...args: any) => any)[] | undefined,
}

class Toolbar {
    private Toolbar_Container: HTMLDivElement;          //Container da barra de abas
    private Content_Container: HTMLElement;             //Container do conteúdo

    public Toolbar_Elements: ToolbarElements[] = [];    //Elementos da barra de abas
    public ChildrensToolbar: HTMLElement[] = [];       //Elementos filhos (Abas) da barra de abas
    public ChildrensContent: HTMLElement[] = [];

    public ToolbarElement_id_base: string = "Ariranha_PluginModule_";
    public ContentElement_id_base: string = "Ariranha_PluginContainer_";
    public PoolEvents: ((element: HTMLElement, toolbar?: Toolbar, ...args: any) => any)[] = [];

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
    constructor(toolbar: HTMLDivElement, content: HTMLDivElement, poolEventsFunction?: ((element: HTMLElement, toolbar?: Toolbar, ...args: any) => any)) {
        this.Toolbar_Container = toolbar;
        this.Content_Container = content;

        /**
         * @param {HTMLElement[]} preload_toolbarElements
         * Variável responsável por importar elementos já existentes no container da barra de abas.
         * Caso já exista uma aba já predefinida no momento da construção, ele importa a aba.
         */
        const preload_toolbarElements: HTMLElement[] = Array.from(toolbar.children) as HTMLElement[];
        preload_toolbarElements.forEach((children) => {
            const events: ((el: HTMLElement, toolbar?: Toolbar, ...args: any) => any)[] = [];

            if (poolEventsFunction) {
                poolEventsFunction(children, this);
                events.push(poolEventsFunction);
            }
            /**
             *  Aplica um push ao elemnto this.Toolbar_Elements, incluindo os elementos já existentes na variável.
             */
            this.Toolbar_Elements.push({ title: children.textContent ?? children.id ?? undefined, toolbarElement: children as HTMLDivElement, contentElementDataset: `${this.ContentElement_id_base}${children.id ?? undefined}`, poolEvents: events });

        });
    }

    private refreshToolbarSelection() {
        (this.Toolbar_Elements).forEach((el) => {
            el.toolbarElement.style.backgroundColor = "";
            (document.querySelector(`[data-screen="${el.contentElementDataset}"]`) as HTMLElement).style.display = "";
        });
    }

    public make = {
        sort: () => {
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
                this.Toolbar_Elements.push({ title: this.get.Dataset.fromToolbarElementId(el), toolbarElement: el, contentElementDataset: this.get.Dataset.fromToolbarElementId(el) });
            }
            return this.Toolbar_Elements as [];
        },
        select: {
            byTitle: (title: string) => {
                this.refreshToolbarSelection();

                // Percorre todos os elementos da barra de abas
                this.Toolbar_Elements.forEach((el) => {
                    // Se o título do elemento da barra de abas foi igual ao título passado como parâmetro...
                    if (el.title === title) {
                        // Pinta o fundo da aba de branco e apresenta o conteúdo da aba.
                        el.toolbarElement.style.backgroundColor = "white";
                        (this.get.Content.fromToolbarElement(el.toolbarElement)[0]).style.display = "";
                    }
                });
            },
        },
        remove: {
            byTitle: (title: string) => {
                const index = this.Toolbar_Elements.findIndex((item) => item.title === title);
                const childrens = this.get.Content.fromToolbarElement(this.Toolbar_Elements[index].toolbarElement);
                childrens.forEach((el) => {
                    el.remove();
                });

                this.Toolbar_Elements[index].toolbarElement.remove();

                this.Toolbar_Elements.splice(index, 1);
            },
            byIndex: (index: number) => {
                const childrens = this.get.Content.fromToolbarElement(this.Toolbar_Elements[index].toolbarElement);
                childrens.forEach((el) => {
                    el.remove();
                });
                this.Toolbar_Elements.splice(index, 1);
            }

        },
        PoolEvents: {
            new: (poolFunction: (...args: any[]) => any) => {
                this.PoolEvents.push(poolFunction);
            },
            run: () => {
                this.Toolbar_Elements.forEach((el) => {
                    const element = el;
                    this.PoolEvents.forEach((events) => {
                        if (!element.poolEvents || !el.poolEvents) return;
                        if (!el.poolEvents.includes(events)) {
                            events(element.toolbarElement, this);
                            element.poolEvents.push(events);
                        }
                    });
                });
            }
        }
    };

    public get = {
        Elements: {
            fromToolbar: () => {
                return Array.from(this.Toolbar_Container.children).filter((element): element is HTMLElement => element instanceof HTMLElement);
            },
            fromContents: () => {
                return Array.from(this.Content_Container.children).filter((element): element is HTMLElement => element instanceof HTMLElement);
            }
        },
        Dataset: {
            fromToolbarElementId: (toolbarElement: HTMLDivElement): string => {
                return toolbarElement.id.split(this.ToolbarElement_id_base)[1];
            },
            fromToolbarElementTitle: (title: string): string | undefined => {
                const element = this.Toolbar_Elements.find(e => e.title === title);
                if (!element) {
                    return undefined;
                }
                return this.get.Dataset.fromToolbarElementId(element.toolbarElement);
            }
        },
        Content: {
            fromToolbarElement: (toolbarElement: HTMLDivElement): HTMLElement[] => {
                return Array.from(document.querySelectorAll(`[data-screen="${this.get.Dataset.fromToolbarElementId(toolbarElement)}"]`)) as HTMLElement[];
            },
            fromToolbarElementTitle: (title: string): HTMLElement[] => {
                const toolbarElement = this.Toolbar_Elements.find(e => e.title === title);
                if (!toolbarElement) return [];

                const contentElements: HTMLElement[] = Array.from(document.querySelectorAll(`[data-screen="${this.get.Dataset.fromToolbarElementId(toolbarElement.toolbarElement)}"]`));
                return contentElements.filter((el): el is HTMLElement => el instanceof HTMLElement);;
            },
        },
        Selected: {
            toolbarElementTitle: () => {
                const selected: ToolbarElements | undefined = this.Toolbar_Elements.find(el => el.toolbarElement.style.backgroundColor === "white");
                if (!selected) return;
                return selected.title;
            },

            toolbarElement: () => {
                const selected: ToolbarElements | undefined = this.Toolbar_Elements.find(el => el.toolbarElement.style.backgroundColor === "white");
                if (!selected) return;
                return selected.toolbarElement;
            }
        }
    };

    /**
     * Função que adiciona vários elementos apenas através de um (ou mais) título.
     * @param titles 
     * Um array de string com o título das abas.
     */
    public addElementsByStringArray(titles: string[]) {
        // Para cada título...
        titles.forEach((elementTitle) => {
            let title = elementTitle;

            let i = 1;
            while (this.Toolbar_Elements.some(el => el.title === title)) {
                title = `${elementTitle}_${i}`;
                i++;
            }

            //...tenta importar o elemento de conteúdo...
            const divElement = this.Content_Container.querySelector(`div[data-screen="${title}"]`);

            // Verifica se o elemento de conteúdo existe, senão...
            if (!divElement) {
                // Cria um novo elemento de conteúdo, altera seu dataset-screen para o título passado...
                const newContent = document.createElement("div");
                newContent.dataset.screen = title;
                newContent.id = `${this.ContentElement_id_base}${title}`;
                newContent.style.display = "none";

                //... e vincula o conteúdo no container de conteúdos.
                this.Content_Container.appendChild(newContent);
            }

            // Cria uma nova aba...
            const newTab = document.createElement("div");
            // ...inclui o título...
            const text = document.createTextNode(title);
            // ...adiciona o botão de fechar e passa o Path da imagem...
            const close = document.createElement("img");
            close.src = "./assets/images/close.png";
            close.classList.add("close");

            // Adiciona um novo Id ao elemento da aba.
            newTab.id = `Ariranha_PluginModule_${title}`;
            // Adiciona o título e a imagem de fechar aba.
            newTab.appendChild(text);
            newTab.appendChild(close);

            // Adiciona a nova aba criada ao container das abas.
            this.Toolbar_Container.appendChild(newTab);

            // Inclui a aba na lista de abas.
            this.Toolbar_Elements.push({ title: title, toolbarElement: newTab, contentElementDataset: title, poolEvents: [] });
            const added = this.Toolbar_Elements[this.Toolbar_Elements.length - 1].toolbarElement;

            this.PoolEvents.forEach(event => event(added, this));


            // Se for o primeiro elemento adicionado, pinta seu fundo de branco.
            if (this.Toolbar_Elements.length === 1) {
                this.make.select.byTitle(title);
            }
        });
    }

    /**
     * Função que adiciona uma nova aba a partir de um elemento de conteúdo.
     *
     * @param {HTMLElement} element
     * Elemento de conteúdo.
     * 
     * @param {string} title
     * Título da aba.
     * 
     * @memberof Toolbar
     */
    public addNewToolbarElementByContentElement(element: HTMLElement, title: string): void {
        // Passa o título da aba para uma variável local.
        // Permite manipular o título.
        let uniqueTitle = title;

        // Repetição que verifica se a aba já existe.
        // Caso exista, ele irá automaticamente corrigir o título, adicionando um indice na frente do título.
        let i = 1;
        while (this.Toolbar_Elements.some(e => e.title === uniqueTitle)) {
            uniqueTitle = `${title}_${i}`;
            i++;
        }

        // Define parâmetros básicos do elemento de conteúdo. 
        element.dataset.screen = uniqueTitle;
        element.style.display = "none";
        element.id = `${this.ContentElement_id_base}${uniqueTitle}`;

        // Elemento da aba.
        const newElement = document.createElement("div");
        newElement.id = `Ariranha_PluginModule_${uniqueTitle}`;

        // Adiciona o título da aba.
        const text = document.createTextNode(uniqueTitle);

        // Imagem do botão de fechar aba.
        const close = document.createElement("img");
        close.src = "./assets/images/close.png";
        close.classList.add("close");

        // Vincula o título e o botão de fechar aba na própria aba.
        newElement.appendChild(text);
        newElement.appendChild(close);

        // Vincula a aba e o conteúdo.
        this.Toolbar_Container.appendChild(newElement);
        this.Content_Container.appendChild(element);

        // Adiciona a aba na lista de abas gerenciada pela classe.
        this.Toolbar_Elements.push({ title: uniqueTitle, toolbarElement: newElement, contentElementDataset: element.dataset.screen, poolEvents: [] });
        const added = this.Toolbar_Elements[this.Toolbar_Elements.length - 1].toolbarElement;

        this.PoolEvents.forEach(event => event(added, this));

        // Caso seja a primeira aba, seleciona a aba.
        if (this.Toolbar_Elements.length === 1) {
            this.make.select.byTitle(uniqueTitle);
        }
    };

    /**
     * Função que seleciona o primeiro elemento da barra de abas após o selecionado ser removido.
     *
     * @memberof Toolbar
     */
    public selectFirstElementWhenRemoved() {
        // Se a barra de tarefas estiver vazia, ele não faz nada, apenas retorna.
        if (this.Toolbar_Elements.length < 1) {
            return;
        }

        // Caso o elemento selecionado não seja o excluído, ele irá manter a seleção no que está atualmente.
        if (this.get.Selected.toolbarElementTitle()) {
            return;
        }

        // Atualiza as cores das abas.
        this.refreshToolbarSelection();
        this.make.select.byTitle(this.Toolbar_Elements[0].title as string);
    }
};

function dragAndDropPoolevent(element: HTMLElement, toolbar: Toolbar) {
    toolbar.ChildrensToolbar = toolbar.get.Elements.fromToolbar();
    toolbar.ChildrensContent = toolbar.get.Elements.fromContents();

    const sort = () => toolbar.make.sort();

    element.querySelector(".close")?.addEventListener("click", (event) => {
        toolbar.make.remove.byTitle(toolbar.get.Dataset.fromToolbarElementId(element as HTMLDivElement));
        toolbar.selectFirstElementWhenRemoved();
        sort();
    });

    element.addEventListener("click", (event) => {
        if ((event.target as HTMLElement).className === "close") return;
        toolbar.ChildrensToolbar.forEach((toolbarElement: any) => {
            if (!toolbarElement) return;
            toolbarElement.style.backgroundColor = "";
        });

        element.style.backgroundColor = "white";

        toolbar.ChildrensContent.forEach((contentElement: any) => {
            if (contentElement.dataset.screen !== element.id.split(toolbar.ToolbarElement_id_base)[1]) {
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

            element.style.left = "0";
            element.style.zIndex = "";
            movimentEnabled = false;

            sort();
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}