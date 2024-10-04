import { ContextBridge } from "electron";

declare global {
    type State = {
        textContent: string;
        lineNumber: number;
        prevRowCount: number;
    }

    interface FileData {
        path: string;
        content: string;
    }
    
    interface ElectronAPI {
        receiveFileData: (callback: (event: Event, fileData: FileData) => void) => void;
        pingSaveData: (callback: () => void) => void;
        saveFileData: (fileData: FileData) => void;
    }
    
    interface Window {
        electron: ElectronAPI;
    }
}

