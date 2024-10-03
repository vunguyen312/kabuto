import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    receiveFileData: (callback: (event: Electron.IpcRendererEvent, fileData: string) => void) => {
        ipcRenderer.on("send-file-data", callback)
    }
});