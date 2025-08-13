/*
 *  Script.ts
 *  Arquivo principal de Script do arquivo "Index.html".
 */

/*
 *  Importando do "Index.html" os conteúdos que serão processados. Segue abaixo a descrição de cada um:
 *  * LABEL_typeIndicator_Message: Label de mensagem de erro.
 *  * TEXTAREA_typeIndicator_Description: Textarea onde a descrição do erro é apresentada.
 *  * DIV_typeIndicator_buttons_container: Conteiner responsável pelos botões na parte inferior da janela.
 *  * IMG_typeIndicator_Image: Imagem relacionada ao tipo de Popup.
 * 
 *  Atenção: Cada nome irá sempre começar com a sua respectiva TAG no HTML.
 */
const LABEL_typeIndicator_Message: HTMLLabelElement = document.getElementById('Type-indicator-title') as HTMLLabelElement;
const TEXTAREA_typeIndicator_Description: HTMLTextAreaElement = document.getElementById('Type-indicator-content') as HTMLTextAreaElement;
const DIV_typeIndicator_buttons_container: HTMLDivElement = document.getElementById('Type-indicator-buttons') as HTMLDivElement;
const IMG_typeIndicator_Image: HTMLImageElement = document.getElementById('Type-indicator-image') as HTMLImageElement;

/*
 *  Importando globais da janela. Segue abaixo a descrição de cada um:
 *  * WINDOW_button_titlebar_closeButton: Botão de fechar a janela.
 *  * WINDOW_label_titlebar_title: Título da janela.
 */
const WINDOW_BUTTON_titlebar_closeButton: HTMLButtonElement = document.getElementById('Window-titlebar-buttons-close') as HTMLButtonElement;
const WINDOW_LABEL_titlebar_title: HTMLLabelElement = document.getElementById('Window-titlebar-titlelabel') as HTMLLabelElement;

function generateWindowContent(type: string) {
    IMG_typeIndicator_Image.src = `./assets/types/${type.toLowerCase()}.png`;

    switch (type) {
        case "Confirm": {
            const button_nao = document.createElement("button");
            const button_sim = document.createElement("button");
            button_nao.textContent = "Não";
            button_sim.textContent = "Sim";
            button_nao.addEventListener('click', () => {
                window.Popup_.onClickCallback('Popup', 'no, close');
            });
            button_sim.addEventListener('click', () => {
                window.Popup_.onClickCallback('Popup', 'yes, close');
            });
            DIV_typeIndicator_buttons_container.appendChild(button_nao);
            DIV_typeIndicator_buttons_container.appendChild(button_sim);
            break;
        }
        case "Error": {
            const button = document.createElement("button");
            button.textContent = "Ok";
            button.addEventListener('click', () => {
                window.Popup_.onClickCallback('Popup', 'close');
            });
            DIV_typeIndicator_buttons_container.appendChild(button);
            break;
        }
        case "Warning": {
            const button = document.createElement("button");
            button.textContent = "Ok";

            DIV_typeIndicator_buttons_container.appendChild(button);
            button.addEventListener('click', () => {
                window.Popup_.onClickCallback('Popup', 'close');
            });
            break;
        }
        case "Message": {
            const button = document.createElement("button");
            button.textContent = "Ok";

            DIV_typeIndicator_buttons_container.appendChild(button);
            button.addEventListener('click', () => {
                window.Popup_.onClickCallback('Popup', 'close');
            });
            break;
        }
    }
};

(function main() {
    window.Popup_.getMessageData((data: MessageBoxData) => {
        WINDOW_LABEL_titlebar_title.textContent = data.Title;
        LABEL_typeIndicator_Message.textContent = data.Message;
        TEXTAREA_typeIndicator_Description.textContent = data.Description;
        generateWindowContent(data.Type);
    });

    WINDOW_BUTTON_titlebar_closeButton.addEventListener('click', () => {
        window.Popup_.onClickCallback('Popup', 'close');
    });
})();