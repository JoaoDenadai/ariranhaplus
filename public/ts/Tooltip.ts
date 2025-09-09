/*
 *  Classe Tooltip.ts
 *  Classe responsável por adicionar a janela dinâmica de dicas ao passar o mouse sob um elemento.
 */

class Tooltip {
    public tooltip_element: HTMLElement;
    public dataset: string;
    public timeout: number;

    private tooptip_show: boolean = false;
    private timeoutId: number | null = null;
    private mouseX: number = 0;
    private mouseY: number = 0;

    /**
     * Creates an instance of Tooltip.
     * @memberof Tooltip
     */
    constructor(dataset: string = "data-tooltip", id: string = "dynamic-tooltip", timeoutMs: number) {
        this.dataset = dataset;
        this.tooltip_element = document.createElement("div");
        this.timeout = timeoutMs;

        this.createElement(id);
        // Inicializa os eventos.
        this.init();
    };

    private createElement(id: string) {
        // Adiciona ao id genérico do tooltip.
        this.tooltip_element.id = id;
        // Adiciona o container da janela dinâmica ao documento.
        document.body.appendChild(this.tooltip_element);
    }

    public init() {
        //
        // Para cada elemento que contém o dataset passado na construção da classe... 
        document.querySelectorAll(`[${this.dataset}]`).forEach((element) => {
            // ...quando o mouse entrar no elemento...
            element.addEventListener("mouseenter", (e: any) => {
                // Armazena a posição X e Y desse element.
                this.mouseX = e.pageX;
                this.mouseY = e.pageY;

                // Armazena o alvo (Ou seja, o elemento).
                const target = e.currentTarget as HTMLElement;

                // Verifica se já existe algum timeout.
                // Caso exista, apenas limpa o intervalo.
                if (this.timeoutId) clearTimeout(this.timeoutId);

                // Aguarda uma quantidade determinada de tempo até mostrar a janela dinâmica.
                this.timeoutId = window.setTimeout(() => {
                    // Após aguardar um tempo com o mouse em cima do element, ele habilita o sistema a mostrar a janela dinâmica.
                    this.tooptip_show = true;
                    this.show(target);
                }, this.timeout);
            });
            // ...quando o mouse se mover...
            element.addEventListener("mousemove", (e: any) => {
                // Atualiza a posição da janela dinâmica.
                this.mouseX = e.pageX;
                this.mouseY = e.pageY;
                // Se a janela estiver habilitada, ele chama a função de mmovimento.
                if (this.tooptip_show) this.movement();
            });
            element.addEventListener("mouseleave", () => this.hide());
        });
    }

    private movement() {
        if (!this.tooltip_element) return;
        const offsetX = 20;
        const offsetY = 20;
        let left = this.mouseX + offsetX;
        let top = this.mouseY + offsetY;

        const tooltipRect = this.tooltip_element.getBoundingClientRect();

        if (left + tooltipRect.width > window.pageXOffset + window.innerWidth) {
            left = window.pageXOffset + window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.pageYOffset + window.innerHeight) {
            top = window.pageXOffset + window.innerHeight - tooltipRect.height - 10;
        }

        this.tooltip_element.style.left = left + "px";
        this.tooltip_element.style.top = top + "px";
    }

    private show(e: HTMLElement) {
        if (!this.tooltip_element) return;
        let html = "";
        let text: string = e.dataset.tooltip as string;
        if (!text) return;
        text = text.replace(/\\n/g, '\n');

        const lines = text.split("\n");

        lines.forEach((line) => {
            if (line.toLowerCase().startsWith("title:")) {
                const raw = line.replace(/title:/i, "");
                html = html + `<div style="font-weight: bold; font-size: 14px; margin: 0 0 2px 0;">${raw.trim()}</div>`;
            } else if (line.toLowerCase().trim().startsWith("description:")) {
                const raw = line.trim().replace(/description:/i, "");
                html = html + `<div style="font-weight: 300; font-size: 12px; margin: 2px 0 2px 0; opacity:0.50;">${raw.trim()}</div>`;
            } else {
                html = html + `<div>${line.trim()}</div>`;
            }
        });

        if (this.tooptip_show) {
            this.tooltip_element.innerHTML = html;
            this.tooltip_element.style.opacity = "1";
            this.movement();
        } else {
            this.tooltip_element.style.opacity = "0";
        }
    }

    private hide() {
        if (!this.tooltip_element) return;
        this.tooltip_element.style.opacity = "0";
        this.tooptip_show = false;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }
}