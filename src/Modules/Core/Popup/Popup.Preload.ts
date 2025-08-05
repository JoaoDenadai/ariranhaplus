/*
 *  Preload.ts
 *  Esse é o arquivo principal de comunicação do Backend e Frontend para popups.
 * 
 *  Atenção: Esse arquivo depende diretamente do @electron.
 */
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

/*
 *  Função principal que expõe as funções para o Frontend.
 *  
 *  Além de definir as funções aqui, também precisa definir a função no globals.d.ts para 
 *  que o Typescript consiga formatar e lidar com funções passadas via runtime.
 */
contextBridge.exposeInMainWorld('Popup_', {
    getMessageData: (callback: (data: MessageBoxData) => void) => {
        ipcRenderer.on('Popup', (event: IpcRendererEvent, data: MessageBoxData) => {
            callback(data);
        });
    },
    onClickCallback: (channel: string, message: string) => {
        ipcRenderer.send(channel, message);
    }
});