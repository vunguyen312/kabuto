import { contextBridge, ipcRenderer } from 'electron';
import FileData from "./types/fileData";

contextBridge.exposeInMainWorld('electron', {
    receiveFileData: (callback: (event: Electron.IpcRendererEvent, fileData: FileData) => void) => {
        ipcRenderer.on("send-file-data", callback)
    },
    pingSaveData: (callback: () => void) => {
        ipcRenderer.on('ping-save-data', callback);
    },
    pingSaveAsData: (callback: () => void) => {
        ipcRenderer.on('ping-save-as-data', callback);
    },
    saveFileData: (fileData: FileData) => {
        ipcRenderer.send('save-file-data', fileData);
    },
    saveFileAsData: (fileData: FileData) => {
        ipcRenderer.send('save-file-as-data', fileData);
    }
});