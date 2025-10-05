/*
 *  Logs.ts
 *  Arquivo criado para englobar a geração e manipulação de Logs de evento em tempo de execução.
 */
import { Prompt } from "../../../Libraries/Libraries";
import Time from "../Time/Time";
import _Window_ from "../Window/Window";


export class Log {
  /*
   *  Log
   *  Classe responsável por todos os métodos de manipulação e geração de Logs de Eventos do
   *  sistema.
   */
  private static Format(Function: string, Content: string, Tag: string): string {
    /*
     *  Format
     *  Essa função apenas formata um conteúdo (Log) e retorna uma string.
     *  Atualmente, ele gera o Log com o horário, função que chamou e o conteúdo do Log.
     */
    const getTime = Time.getTime("pt-BR").from("America/Sao_Paulo");
    return `[${getTime.hours}] [${Tag}] [${Function}] ${Content}`;
  }

  public static New() {
    /*
     *  New
     *  Essa função do tipo "Logger" retorna outras funções 
     *  onde pode-se escolher qual tipo de Log será gerado.
     *  Atenção: Apenas a função "Critical" interrompe a execução do código
     *  ao ser chamado.
     */

    return {
      Message: (Function: string, Content: string) => {
        Prompt.log(this.Format(Function, Content, "Message"));
      },
      Warning: (Function: string, Content: string) => {
        Prompt.warn(this.Format(Function, Content, "Warning"));
      },
      Error: (Function: string, Content: string) => {
        Prompt.error(this.Format(Function, Content, "Error"));
      },
      Critical: (Function: string, Content: string) => {
        throw new Error(this.Format(Function, Content, "Critical"));
      }
    };
  }
}

export class Web {
  private Parent: _Window_;

  constructor(Window: _Window_) {
    this.Parent = Window;
  }

  private Format(Function: string, Content: string, Tag: string): string {
    const getTime = Time.getTime("pt-BR").from("America/Sao_Paulo");
    return `[${getTime.hours}] [${Tag}] [${Function}] ${Content}`;
  }

  public New() {
    return {
      Message: (Function: string, Content: string) => {
        this.Parent.webContents.send("New: Log", this.Format(Function, Content, "Message"), "Message");
      },
      Warning: (Function: string, Content: string) => {
        this.Parent.webContents.send("New: Log", this.Format(Function, Content, "Warning"), "Warning");
      },
      Error: (Function: string, Content: string) => {
        this.Parent.webContents.send("New: Log", this.Format(Function, Content, "Error"), "Error");
      }
    };
  }
}