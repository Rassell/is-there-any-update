import { contextBridge, ipcRenderer } from 'electron';

export const api = {
    call: async (channel: string, ...args: any[]) => {
        return await ipcRenderer.invoke(channel, ...args);
    },
    subscribe: (channel: string, callback: Function) => {
        ipcRenderer.on(channel, (_, data) => callback(data));
    },
};

contextBridge.exposeInMainWorld('Api', api);
