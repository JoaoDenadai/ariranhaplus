/*
 *  Time.ts
 *  Arquivo criado para englobar classes e funções que retornam dados de tempo e horário.
 */

interface Date {
  day: string;
  hours: string;
}

export default class Time {
  /*
   *  Time
   *  Essa classe tem o objetivo de englobar todas as funções e valores
   *  úteis para obter dados de horário, dia, mês, entre vários outros.
   *
   *  Importante: Todas as funções dessa classe são estáticas e síncronas.
   *  Não é importante definir elas como assíncronas pois não são operações
   *  pesadas ao ponto de demorar mais do que milissegundos.
   *
   */
  public static getTime(Lang: string) {
    /*
     *  Retorna duas outras funções que retornam o horário em contextos diferentes.
     *  From: Precisa que seja informado pelo argumento o TimeZone.
     *  Auto: Já detecta automaticamente o TimeZone do usuário pelo sistema operacional.
     */
    return {
      from: (TimeZone: string): Date => {
        const time = new Date();
        return {
          day: String(time.toLocaleDateString(Lang, { timeZone: TimeZone })),
          hours: String(time.toLocaleTimeString(Lang, { timeZone: TimeZone })),
        };
      },
      auto: (): Date => {
        const fromUser = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const time = new Date();

        return {
          day: String(time.toLocaleDateString(Lang, { timeZone: fromUser })),
          hours: String(time.toLocaleTimeString(Lang, { timeZone: fromUser })),
        };
      },
    };
  }
}
