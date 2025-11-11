import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  getVersion: () => ipcRenderer.invoke('app-version'),
  onAppVersionReply: (callback: (version: string) => void) =>
    ipcRenderer.on('app-version', (_, { version }) => callback(version)),
};

contextBridge.exposeInMainWorld('api', api);
