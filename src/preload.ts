import { contextBridge, ipcRenderer } from 'electron';

export const api = {
    call: async (channel: string, ...args: any[]) => {
        return await ipcRenderer.invoke(channel, ...args);
    },
};

contextBridge.exposeInMainWorld('Api', api);
