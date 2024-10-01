import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    openDialog: async () => {
        return await ipcRenderer.invoke('open-file-dialog');
    }
});