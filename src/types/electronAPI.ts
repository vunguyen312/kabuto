import { ContextBridge } from "electron";
import FileData from "./fileData";

export default interface ElectronAPI {
    receiveFileData: (callback: (event: Event, fileData: FileData) => void) => void;
    pingSaveData: (callback: () => void) => void;
    pingSaveAsData: (callback: () => void) => void;
    saveFileData: (fileData: FileData) => void;
    saveFileAsData: (fileData: FileData) => void;
}