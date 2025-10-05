/*
 *  Popup.ts
 *  Arquivo responsável pelo gerenciamento e criação de janelas popup no programa.
 */

/*
 *  Importa a parte de comunicação e bibliotecas base.
 */
import { Instance, Path, path_Dependencies } from "../../../Libraries/Libraries";
import { ipcMain } from 'electron';


/*
 *  Importa dependências de outros classes.
 */
import { Log } from "../Logs/Logs";
import _Window_ from "../Window/Window";

export default class Popup {
    private static PopupWindow: _Window_ | undefined = undefined;
    private static Parent: _Window_ | undefined = undefined;

    public static async MessageBoxFromFrontend(Title: string, Type: string, Message: string, Description: string, Close?: boolean): Promise<void | boolean> {
        return await this.MessageBox(Title, Type, Message, Description, this.Parent ?? undefined, Close ?? false);
    }

    private static async MessageBox(Title: string, Type: string, Message: string, Description: string, Target?: _Window_, Close?: boolean): Promise<void | boolean> {
        /*
         *  Essa função assíncrona abre uma nova tela de Popup e processa a resposta do ipcRenderer.
         *  A função irá parar a execução do programa até que a Promise seja retornada (E isso apenas ocorre quando a janela for fechada, de alguma forma).
         * 
         *  Apenas é permitido uma janela de Popup por vez.
         *  Isso acontece pois não faz sentido aguardar mais de uma confirmação do usuário ao mesmo tempo.
         * 
         *  Importante: Para funcionar, a instância do aplicativo deve estar já funcionando.
         */
        if (!Instance.isReady()) {
            Log.New().Error('MessageBox',
                'A instância da aplicação ainda não foi iniciada. A janela não pode ser executada antes de que a instância esteja pronta.'
            );
            return;
        }
        if (Popup.PopupWindow) {
            Log.New().Message('MessageBox',
                "Não é possível inicializar mais de uma janela de mensagem simultâneamente. " +
                "Feche a janela que está sendo executada e chame a função novamente.");
            return;
        }

        try {
            /*
             *  O programa tenta gerar a janela de Popup pelo objeto "Window" definido no arquivo de "Libraries.ts".
             *  É preciso passar pelo menos alguma janela de parente para que ele foque na janela de Popup.
             * 
             *  Observe que a janela depende de "Preload", então, para comunicar-se com o frontend, precisa declarar as
             *  funções pelo arquivo de "Preload.ts" no mesmo diretório que essa classe.
             */
            Popup.PopupWindow = new _Window_({
                width: 500,
                height: 300,
                minWidth: 400,
                minHeight: 300,
                maxHeight: 400,
                maxWidth: 600,
                frame: false,
                show: false,
                parent: Target,
                modal: true,
                webPreferences: {
                    contextIsolation: true,
                    nodeIntegration: false,
                    preload: Path.join(__dirname, 'Popup.Preload.js'),
                }
            });
        } catch (error) {
            Log.New().Error('MessageBox',
                'Não foi possível gerar uma nova janela de mensagem: ' + String(error)
            );
            return;
        }

        /*
         *  Armazenamos um evento na janela.
         *  Assim que a janela estiver pronta para ser carregada, ele simplesmente abre a janela.
         */
        Popup.PopupWindow.on('ready-to-show', () => {
            /*  Tudo o que for preenchido aqui abaixo só irá ser executado quando a janela estiver
             *  pronta para ser exibida.
             */
            Popup.PopupWindow?.show();
            Popup.PopupWindow?.focus();
        });

        try {
            /*  Carrega o conteúdo da janela.
             *  Caso o arquivo "Index.html" seja movido, precisa editar o caminho abaixo.
             */
            await Popup.PopupWindow.loadFile(Path.join(path_Dependencies, "Popup", "Index.html"));
        } catch (error) {
            Log.New().Error('MessageBox',
                'Não foi possível carregar o conteúdo da janela de mensagem: ' + String(error)
            );
            Popup.PopupWindow.destroy();
            return;
        }

        /*
         *  A função abaixo envia para o ipcRenderer, pelo canal "Popup", os dados da janela
         *  de Popup. Segue abaixo:
         *  * Type: Tipo de janela de Popup.
         *  * Title: Título da janela de Popup.
         *  * Message: Mensagem principal da janela de Popup.
         *  * Description: Descrição da mensagem.
         */
        Popup.PopupWindow.webContents.send('Popup', {
            Type: Type,
            Title: Title,
            Message: Message,
            Description: Description,
        } as MessageBoxData);

        return new Promise((resolve) => {
            /*
             *  Esse método é o retorno do Promise da função atual (Por ser assíncrona).
             *  Com isso, a Promise irá aguardar a resposta do ipcRenderer.
             * 
             *  Com isso, se houver alguma mensagem no canal "Popup" vindo do ipcRenderer, ele irá
             *  executar o bloco de código abaixo.
             */
            ipcMain.once("Popup", (event, message: string) => {
                /*
                 *  Com isso, esse bloco de código irá tratar a mensagem passada do ipcRenderer para o ipcMain.
                 *
                 *  Para acessar a mensagem, basta chamar o argumento "message" pois, assim que houver retorno,
                 *  ele irá apresentar a mensagem vinda do ipcRenderer.
                 */
                let Return: boolean = false;

                /*
                 *  Garante que, mesmo se a mensagem vier com alguma letra maíuscula, a mensagem seja interpretada
                 *  corretamente e traduzida em ações aqui pelo evento.
                 */
                message = message.toLowerCase();

                /*
                 *  Aqui são blocos de condições que vão verificar se determinado valor existe na mensagem. Caso exista,
                 *  determinada ação é executada.
                 */
                /*
                 *  Caso a mensagem contenha "yes" e "no", ele retorna um erro crítico, informando que não é possível retornar dois valores
                 *  opostos como argumento.
                 */
                if (message.includes("yes") && message.includes("no")) {
                    Log.New().Critical("MessageBox", "Não é possível passar dois parâmetros com lógicas distintas: true e false ao mesmo tempo.");
                    resolve();
                }

                /*
                 *  Traduz a mensagem, sendo "yes" transformado em "true" e "no" em "false".
                 *  Mais para frente, esse será o valor que será retornado pelo Promise.
                 * 
                 *  Essa tratativa cuida de Popups do tipo "Confirm", onde há dois botões: Sim e Não.
                 */
                if (message.includes("yes")) {
                    Return = true;
                } else if (message.includes("no")) {
                    Return = false;
                }

                /*
                 *  Caso solicitado pelo ipcRenderer, caso contenha "close" na mensagem, ele fecha a janela e limpa
                 *  a variável estática.
                 *
                 *  A partir daqui, é possível inicializar uma nova janela de Popup.
                 */
                if (message.includes("close")) {
                    if (Popup.PopupWindow) {
                        Popup.PopupWindow.close();
                        Popup.PopupWindow = undefined;
                    }
                }

                /*
                 *  Caso tenha sido passado o argumento de "Close = true", ele irá encerrar o programa todo.
                 */
                if (Close) {
                    Instance.exit();
                }

                /*
                 *  Resolve a Promise.
                 */
                resolve(Return);
            });
        });

    }

    public static Set(): {
        Parent: (Parent: _Window_) => void;
    } {
        /*
         *  A função abaixo adiciona uma nova janela como "Parent".
         *
         *  Aqui, o "parent" é a janela principal em que os Popups irão fazer parte.
         *  Ao passar a janela, o próprio sistema irá entender que, no momento, aquela é a janela principal.
         * 
         *  Enquanto o Popup estiver aberto, a janela "Parent" ficará pausada aguardando o Popup ser fechado.
         */
        return {
            Parent: (Parent: _Window_) => {
                Popup.Parent = Parent;
            },
        };
    }

    public static Remove(): {
        Parent: () => void;
    } {
        /*
         *  Essa função remove uma janela "Parent" da classe.
         *
         *  Aqui pode ser cadastrados novos métodos dentro do "return" para ser
         *  chamados externamente.
         */
        return {
            Parent: () => {
                Popup.Parent = undefined;
            }
        };
    };

    public static New(): {
        Message: (Title: string, Description: string, Window?: _Window_, Close?: boolean) => Promise<void>;
        Warning: (Title: string, Description: string, Window?: _Window_, Close?: boolean) => Promise<void>;
        Error: (Title: string, Description: string, Window?: _Window_, Close?: boolean) => Promise<void>;
        Confirm: (Title: string, Description: string, Window?: _Window_, Close?: boolean) => Promise<boolean>
    } {
        /*
         *  Função principal da classe.
         *  Essa função retorna outras funções que são chamadas dependendo da necessidade de quem está chamando.
         *
         *  Classes ou funções externas, caso queiram abrir uma nova janela de Popup, devem chamar exatamente por aqui e
         *  passar os argumentos necessários de cada função.
         *
         */
        return {
            Message: async (Title: string, Description: string, Window?: _Window_, Close?: boolean) => {
                await Popup.MessageBox('Mensagem do sistema', 'Message', Title, Description, Window ?? Popup.Parent, Close ?? false);
            },
            Warning: async (Title: string, Description: string, Window?: _Window_, Close?: boolean) => {
                await Popup.MessageBox('Aviso', 'Warning', Title, Description, Window ?? Popup.Parent, Close ?? false);
            },
            Error: async (Title: string, Description: string, Window?: _Window_, Close?: boolean) => {
                await Popup.MessageBox('Violações encontradas', 'Error', Title, Description, Window ?? Popup.Parent, Close ?? false);
            },
            Confirm: async (Title: string, Description: string, Window?: _Window_, Close?: boolean) => {
                return await Popup.MessageBox('Confirmação', 'Confirm', Title, Description, Window ?? Popup.Parent, Close ?? false) as boolean;
            },
        };
    }
};