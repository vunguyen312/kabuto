import { contextBridge, ipcRenderer } from 'electron';
import { pingSaveData, sendFileData } from './fileHandler';

contextBridge.exposeInMainWorld('electron', {
    receiveFileData: (callback: (event: Electron.IpcRendererEvent, fileData: FileData) => void) => {
        ipcRenderer.on("send-file-data", callback)
    },
    pingSaveData: (callback: () => void) => {
        ipcRenderer.on('ping-save-data', callback);
    },
    saveFileData: (fileData: FileData) => {
        ipcRenderer.send('save-file-data', fileData);
    }
});