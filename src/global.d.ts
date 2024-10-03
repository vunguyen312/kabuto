import { ContextBridge } from "electron";

declare global {
    type State = {
        textContent: string;
        lineNumber: number;
        prevRowCount: number;
    }
    
    interface ElectronAPI {
        receiveFileData: (callback: (event: Event, fileData: string) => void) => void;
    }
    
    interface Window {
        electron: ElectronAPI;
    }
}

