import { ContextBridge } from "electron";

declare global {
    type State = {
        textContent: string;
        lineNumber: number;
        prevRowCount: number;
    }

    interface FileData {
        path: string | undefined;
        content: string;
    }
    
    interface ElectronAPI {
        receiveFileData: (callback: (event: Event, fileData: FileData) => void) => void;
        pingSaveData: (callback: () => void) => void;
        pingSaveAsData: (callback: () => void) => void;
        saveFileData: (fileData: FileData) => void;
        saveFileAsData: (fileData: FileData) => void;
    }
    
    interface Window {
        electron: ElectronAPI;
    }
}

