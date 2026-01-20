import FileData from "./fileData";

export default interface ElectronAPI {
    pingNewFile: (callback: () => void) => void;
    receiveFileData: (callback: (event: Event, fileData: FileData) => void) => void;
    pingSaveData: (callback: () => void) => void;
    pingSaveAsData: (callback: () => void) => void;
    createNewFile: () => FileData;
    saveFileData: (fileData: FileData) => void;
    saveFileAsData: (fileData: FileData) => void;
}