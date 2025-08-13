
class UI {
    public static async Loading<T>(Function: () => Promise<T>) {
        const Loader = document.getElementById("loader") as HTMLElement;
        if (!Loader) return await Function();

        void Loader.offsetWidth;
        Loader.style.animation = "slide 1s ease-in-out infinite";

        try {
            return await Function();
        } finally {
            Loader.style.animation = "none";
        }
    }
}

class Tooltip {
    static showTooltip() {
        // Cria o tooltip uma única vez e adiciona ao body
        const tooltip = document.createElement('div');
        tooltip.id = 'dynamic-tooltip';
        document.body.appendChild(tooltip);

        // Função para mostrar tooltip
        function showTooltip(e: any) {
            let text: string = (e.target.dataset.tooltip);
            if (!text) return;
            text = text.replace(/\\n/g, '\n');

            const lines = text.split("\n");
            let html = "";

            lines.forEach((line: string) => {
                const lower = line.toLowerCase();
                if (lower.startsWith("title:")) {
                    html += `<div style="font-weight: bold; font-size: 14px; margin: 0 0 2px 0;">
                    ${line.replace(/title:/i, '').trim()}
                </div>`;
                } else {
                    html += `<div>${line.trim()}</div>`;
                }
            });

            tooltip.innerHTML = html;
            tooltip.style.opacity = '1';

            // Posição: um pouco abaixo e à direita do mouse
            const offsetX = 12;
            const offsetY = 20;
            let left = e.pageX + offsetX;
            let top = e.pageY + offsetY;

            // Evitar que ultrapasse o limite da janela (janela muito pequena)
            const tooltipRect = tooltip.getBoundingClientRect();
            if (left + tooltipRect.width > window.pageXOffset + window.innerWidth) {
                left = window.pageXOffset + window.innerWidth - tooltipRect.width - 10;
            }
            if (top + tooltipRect.height > window.pageYOffset + window.innerHeight) {
                top = window.pageYOffset + window.innerHeight - tooltipRect.height - 10;
            }

            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        }

        // Função para esconder tooltip
        function hideTooltip() {
            tooltip.style.opacity = '0';
        }

        // Adiciona listeners para todos os inputs que têm data-tooltip
        document.querySelectorAll('input[data-tooltip]').forEach(input => {
            input.addEventListener('mousemove', showTooltip);
            input.addEventListener('mouseleave', hideTooltip);
        });
    }
}
Tooltip.showTooltip();

window.WebContent.Log((msg, type) => {
    switch (type) {
        case "Error": {
            console.error(msg);
            break;
        }
        case "Message": {
            console.log(msg);
            break;
        }
        case "Warning": {
            console.warn(msg);
            break;
        }
    }
});

window.Plugins_.initCss((Css: string) => {
    const fromPlugin = document.createElement('style');
    fromPlugin.textContent = Css;
    document.head.appendChild(fromPlugin);
});