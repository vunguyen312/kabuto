import { contextBridge, ipcRenderer } from 'electron';
import FileData from "./types/fileData";

contextBridge.exposeInMainWorld('electron', {
    createNewFile: () => 
        ipcRenderer.invoke('create-new-file'),
    newWindow: () =>
        ipcRenderer.invoke('new-window'),
    openFile: () =>
        ipcRenderer.invoke('open-file'),
    saveFile: (fileData: FileData) =>
        ipcRenderer.invoke('save-file', fileData),
    saveFileAs: (fileData: FileData) =>
        ipcRenderer.invoke('save-file-as', fileData),
    exitWindow: () =>
        ipcRenderer.invoke('exit-window')
});