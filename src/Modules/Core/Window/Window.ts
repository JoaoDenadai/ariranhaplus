/*
 *  Window.ts
 *  Arquivo principal de criação e gerenciamento de janelas.
 */
import { BrowserWindow, Preferences } from "../../../Libraries/Libraries";

/*
 *  Classe principal a ser exportada.
 *  Observação: Ela extende a classe BrowserWindow, com isso, é necessária inicialização com super.
 */
export default class SysWindow extends BrowserWindow {
  /*
   *  Window
   *  Essa função trabalha tanto com métodos estáticos e dinâmicos (Por objeto).
   *  Para método estático, a função gerencia e armazena uma janela principal (Que precisa ser passada via função "setMainWindow").
   * 
   */

  constructor(Options: Preferences) {
    super(Options);
  }

  async awaitFocus(): Promise<void> {
    return new Promise((Resolve) => {
      if (this.isFocused()) {
        Resolve();
      } else {
        this.on("focus", () => Resolve());
        this.focus();
      };
    });
  };

  addWindowPoolEvents(Function: () => undefined) {
    Function();
  };

}
