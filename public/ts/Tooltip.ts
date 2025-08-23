class Tooltip {
    public tooltip_element: HTMLElement;
    private tooptip_show: boolean = false;
    private timeoutId: number | null = null;
    private mouseX: number = 0;
    private mouseY: number = 0;

    constructor() {
        this.tooltip_element = document.createElement("div");
        this.tooltip_element.id = "dynamic-tooltip";
        document.body.appendChild(this.tooltip_element);
        this.initTooltip();
    };

    public initTooltip() {
        document.querySelectorAll("[data-tooltip]").forEach((element) => {
            element.addEventListener("mouseenter", (e: any) => {
                this.mouseX = e.pageX;
                this.mouseY = e.pageY;

                const target = e.currentTarget as HTMLElement;

                if (this.timeoutId) clearTimeout(this.timeoutId);

                this.timeoutId = window.setTimeout(() => {
                    this.tooptip_show = true;
                    this.show(target);
                }, 1000);
            });
            element.addEventListener("mousemove", (e: any) => {
                this.mouseX = e.pageX;
                this.mouseY = e.pageY;
                if (this.tooptip_show) this.movement();
            });
            element.addEventListener("mouseleave", () => this.hide());
        });
    }

    private movement() {
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
        this.tooltip_element.style.opacity = "0";
        this.tooptip_show = false;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }
}