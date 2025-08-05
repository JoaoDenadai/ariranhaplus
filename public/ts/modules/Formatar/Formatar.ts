

const Documents = {
    FISICA: ["CPF", "RG"],
    JURIDICA: ["CNPJ", "IE"],
    ESTRANGEIRO: ["PP"]
};

const DIV_Entity_Group = document.getElementById('MENU_Entity') as HTMLElement;
const DIV_Document_Group = document.getElementById('MENU_Documents') as HTMLElement;
const INPUT_Document = document.getElementById('INPUT_USER-Document') as HTMLInputElement;
const SELECT_State = document.getElementById('SELECT_USER-State') as HTMLSelectElement;
const INPUT_Checkbox_AutoCopy = document.getElementById('INPUT_Checkbox_AutoCopy') as HTMLInputElement;
const INPUT_Checkbox_IP = document.getElementById('INPUT_Checkbox_IP') as HTMLInputElement;
const INPUT_Checkbox_Brasilapi = document.getElementById('INPUT_Checkbox_Brasilapi') as HTMLInputElement;


const IMG_Status = document.getElementById('LOADING-IMG-Status') as HTMLImageElement;

let GLOBAL_Document: string = "CNPJ";
let GLOBAL_AutoCopy: boolean = INPUT_Checkbox_AutoCopy.checked;
let GLOBAL_lastFormatedClipboard: string;

class Formatar {
    public GLOBAL_isFormated: boolean = false;

    public formatDocumentEvent(Document: string): string {
        this.GLOBAL_isFormated = false;
        let Value: string = Document;

        if (GLOBAL_Document === "PP") {
            Value = (Value.toUpperCase()).slice(0, 2).replace(/[^A-Z]/g, "") + (Value.toUpperCase()).slice(2).replace(/[^0-9]/g, "");
        } else {
            Value = Value.replace(/[^0-9]/g, '');
        }

        switch (GLOBAL_Document) {
            case "CPF": {
                INPUT_Document.maxLength = 14;

                if (Value.length === 11) {
                    Value = `${Value.slice(0, 3)}.${Value.slice(3, 6)}.${Value.slice(6, 9)}-${Value.slice(9, 11)}`;
                    this.GLOBAL_isFormated = true;
                }
                break;
            }
            case "CNPJ": {
                INPUT_Document.maxLength = 18;

                if (Value.length === 14) {
                    Value = `${Value.slice(0, 2)}.${Value.slice(2, 5)}.${Value.slice(5, 8)}/${Value.slice(8, 12)}-${Value.slice(12, 14)}`;
                    this.GLOBAL_isFormated = true;
                }
                break;
            }
            case "RG": {
                INPUT_Document.maxLength = 12;

                if (Value.length === 9) {
                    Value = `${Value.slice(0, 2)}.${Value.slice(2, 5)}.${Value.slice(5, 8)}-${Value.slice(8)}`;
                    this.GLOBAL_isFormated = true;
                }
                break;
            }
            case "PP": {
                INPUT_Document.maxLength = 8;
                this.GLOBAL_isFormated = true;
                break;
            }
            case "IE": {
                switch (SELECT_State.value) {
                    case "AC": {
                        INPUT_Document.maxLength = 15;

                        if (Value.length === 13) {
                            Value = `${Value.slice(0, 2)}.${Value.slice(2, 5)}.${Value.slice(5, 8)}/${Value.slice(8, 11)}-${Value.slice(11)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "AL": {
                        INPUT_Document.maxLength = 9;
                        this.GLOBAL_isFormated = true;
                        break;
                    }
                    case "AP": {
                        INPUT_Document.maxLength = 9;
                        this.GLOBAL_isFormated = true;
                        break;
                    }
                    case "AM": {
                        INPUT_Document.maxLength = 12;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 2)}.${Value.slice(2, 5)}.${Value.slice(5, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "BA": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 7)}-${Value.slice(7, 9)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "CE": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "DF": {
                        INPUT_Document.maxLength = 14;

                        if (Value.length === 13) {
                            Value = `${Value.slice(0, 11)}-${Value.slice(11)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "ES": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "GO": {
                        INPUT_Document.maxLength = 12;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 2)}.${Value.slice(2, 5)}.${Value.slice(5, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "MA": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "MT": {
                        INPUT_Document.maxLength = 12;

                        if (Value.length === 11) {
                            Value = `${Value.slice(0, 10)}-${Value.slice(10)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "MS": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "MG": {
                        INPUT_Document.maxLength = 16;

                        if (Value.length === 13) {
                            Value = `${Value.slice(0, 3)}.${Value.slice(3, 6)}.${Value.slice(6, 9)}/${Value.slice(9)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "PA": {
                        INPUT_Document.maxLength = 11;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 2)}-${Value.slice(2, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "PB": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "PR": {
                        INPUT_Document.maxLength = 12;

                        if (Value.length === 10) {
                            Value = `${Value.slice(0, 3)}.${Value.slice(3, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "PE": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 7)}-${Value.slice(7)}`;
                            this.GLOBAL_isFormated = true;
                        }

                        break;
                    }
                    case "PI": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "RJ": {
                        INPUT_Document.maxLength = 11;

                        if (Value.length === 8) {
                            Value = `${Value.slice(0, 2)}.${Value.slice(2, 5)}.${Value.slice(5, 7)}-${Value.slice(7)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "RN": {
                        INPUT_Document.maxLength = 12;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 2)}.${Value.slice(2, 5)}.${Value.slice(5, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "RS": {
                        INPUT_Document.maxLength = 11;

                        if (Value.length === 10) {
                            Value = `${Value.slice(0, 3)}/${Value.slice(3)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "RO": {
                        INPUT_Document.maxLength = 15;

                        if (Value.length === 14) {
                            Value = `${Value.slice(0, 13)}-${Value.slice(13)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "RR": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "SC": {
                        INPUT_Document.maxLength = 11;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 3)}.${Value.slice(3, 6)}.${Value.slice(6, 9)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "SP": {
                        INPUT_Document.maxLength = 15;

                        if (Value.length === 12) {
                            Value = `${Value.slice(0, 3)}.${Value.slice(3, 6)}.${Value.slice(6, 9)}.${Value.slice(9)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "SE": {
                        INPUT_Document.maxLength = 10;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                    case "TO": {
                        INPUT_Document.maxLength = 12;

                        if (Value.length === 9) {
                            Value = `${Value.slice(0, 8)}-${Value.slice(8)}`;
                            this.GLOBAL_isFormated = true;
                        }

                        if (Value.length === 11) {
                            Value = `${Value.slice(0, 10)}-${Value.slice(10)}`;
                            this.GLOBAL_isFormated = true;
                        }
                        break;
                    }
                }
                break;
            }
        };

        return Value;
    }

    public unformatDocumentEvent(Document: string, RegEx: RegExp): string {
        return Document.replace(RegEx, "");
    }

    public static includes(RegEx: RegExp, Value: string): boolean {
        return RegEx.test(Value);
    }
}

class Keyboard {
    public static shortcutEvent<T>(Shortcuts: () => T): void {
        Shortcuts();
    }
}


async function Brasilapi_Cnpj(CNPJ: string) {
    if (GLOBAL_Document !== "CNPJ") return;
    if (!INPUT_Checkbox_Brasilapi.checked) return;

    IMG_Status.style.display = "none";

    await UI.Loading(async () => {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${CNPJ}`);
        if (response.ok) {
            IMG_Status.src = "./assets/check.png";
            IMG_Status.title = "O documento foi verificado e consta na receita federal";

        } else {
            IMG_Status.src = "./assets/error.png";
            IMG_Status.title = "O documento não consta na receita federal";
        }
        IMG_Status.style.display = "flex";
    });
}

function isCNPJForBrasilapi() {
    if (GLOBAL_Document === "CNPJ") {
        INPUT_Checkbox_Brasilapi.checked = true;
        INPUT_Checkbox_Brasilapi.disabled = false;
    } else {
        INPUT_Checkbox_Brasilapi.checked = false;
        INPUT_Checkbox_Brasilapi.disabled = true;
    }
}

window.ariranha_.getClipboard((text) => {
    if (GLOBAL_lastFormatedClipboard === text) return;
    const Document = new Formatar().formatDocumentEvent(text);
    window.ariranha_.sendClipboard(Document);
});

function frontendPoolEvents() {
    DIV_Entity_Group.addEventListener('click', function (Event) {
        if ((Event.target as HTMLElement).id === DIV_Entity_Group.id) return;

        IMG_Status.style.display = "none";
        const Target = (Event.target as HTMLElement);

        const Selected = Target.dataset.type as keyof typeof Documents;

        (DIV_Document_Group.querySelectorAll("div")).forEach((Button) => {
            Button.style.backgroundColor = "";
            Button.style.display = "none";
        });

        (DIV_Entity_Group.querySelectorAll("div")).forEach((Button) => {
            Button.style.backgroundColor = "";
        });

        Target.style.backgroundColor = "white";
        DIV_Entity_Group.insertBefore(Target, DIV_Entity_Group.firstElementChild);

        Documents[Selected].forEach((Button) => {
            const Div = DIV_Document_Group.querySelector(`div[data-type="${Button}"]`) as HTMLElement;
            Div.style.display = "flex";
            DIV_Document_Group.appendChild(Div);
        });

        (DIV_Document_Group.querySelector(`div[data-type="${Documents[Selected][0]}"]`) as HTMLElement).style.backgroundColor = "white";

        if (String(Documents[Selected][0]) === "IE") {
            (document.getElementById('SELECT_USER-State') as HTMLSelectElement).style.display = 'flex';
        } else {
            (document.getElementById('SELECT_USER-State') as HTMLSelectElement).style.display = 'none';
        }

        GLOBAL_Document = String(Documents[Selected][0]);

        isCNPJForBrasilapi();

        INPUT_Document.value = "";
    });

    DIV_Document_Group.addEventListener('click', function (Event) {
        if ((Event.target as HTMLElement).id === DIV_Document_Group.id) return;
        IMG_Status.style.display = "none";

        (DIV_Document_Group.querySelectorAll('div')).forEach((Div) => {
            if (Div) Div.style.backgroundColor = "";
        });

        (DIV_Document_Group.querySelector(`div[data-type="${(Event.target as HTMLElement).dataset.type as string}"]`) as HTMLElement).style.backgroundColor = "white";

        GLOBAL_Document = String((Event.target as HTMLElement).dataset.type);

        if ((Event.target as HTMLElement).dataset.type === "IE") {
            (document.getElementById('SELECT_USER-State') as HTMLSelectElement).style.display = 'flex';
        } else {
            (document.getElementById('SELECT_USER-State') as HTMLSelectElement).style.display = 'none';
        }

        DIV_Document_Group.insertBefore((Event.target as HTMLElement), DIV_Document_Group.firstElementChild);

        isCNPJForBrasilapi();

        INPUT_Document.value = "";
    });

    INPUT_Document.addEventListener('input', function () {
        const Buffer = new Formatar();
        INPUT_Document.value = Buffer.formatDocumentEvent(INPUT_Document.value);
        if (Buffer.GLOBAL_isFormated) {
            window.ariranha_.sendClipboard(INPUT_Document.value);
            Brasilapi_Cnpj(Buffer.unformatDocumentEvent(INPUT_Document.value, /[^0-9]/g));
        }
    });

    INPUT_Document.addEventListener('keydown', function (Event) {
        Keyboard.shortcutEvent(() => {
            if (Event.altKey && Event.key.toLowerCase() === "f") {
                Event.preventDefault();
                if (Formatar.includes(/[^0-9A-Z]/g, INPUT_Document.value)) {
                    INPUT_Document.value = new Formatar().unformatDocumentEvent(INPUT_Document.value, /[^0-9A-Z]/g);
                } else {
                    INPUT_Document.value = new Formatar().formatDocumentEvent(INPUT_Document.value);
                }
            }
        });
    });

    INPUT_Document.addEventListener('paste', function (Event) {
        Event.preventDefault();
        INPUT_Document.value = (Event.clipboardData?.getData("text") as string);

        const tempBuffer = new Formatar();
        INPUT_Document.value = tempBuffer.formatDocumentEvent(INPUT_Document.value);
        if (GLOBAL_Document === "CNPJ" && tempBuffer.GLOBAL_isFormated) {
            Brasilapi_Cnpj(tempBuffer.unformatDocumentEvent(INPUT_Document.value, /[^0-9]/g));
        }
    });

    INPUT_Checkbox_AutoCopy.addEventListener('change', () => {
        GLOBAL_AutoCopy = INPUT_Checkbox_AutoCopy.checked;
    });

    INPUT_Checkbox_IP.addEventListener('change', () => {
        window.ariranha_.setInteligentProcessor(INPUT_Checkbox_IP.checked);
    });

    INPUT_Checkbox_Brasilapi.addEventListener('change', () => {
        IMG_Status.style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    (DIV_Document_Group.querySelectorAll("div")).forEach((Button) => {
        Button.style.backgroundColor = "";
        Button.style.display = "none";
    });


    Documents["JURIDICA"].forEach((Button) => {
        const Div = DIV_Document_Group.querySelector(`div[data-type="${Button}"]`) as HTMLElement;
        Div.style.display = "flex";
        DIV_Document_Group.appendChild(Div);
    });

    (DIV_Entity_Group.querySelector(`div[data-type="JURIDICA"]`) as HTMLElement).style.backgroundColor = "white";
    (DIV_Document_Group.querySelector(`div[data-type="CNPJ"]`) as HTMLElement).style.backgroundColor = "white";

    frontendPoolEvents();
});

