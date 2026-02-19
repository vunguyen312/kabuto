import FileData from "./fileData";

export default interface ElectronAPI {
    pingNewFile: (callback: () => void) => void;
    receiveFileData: (callback: (event: Event, fileData: FileData) => void) => void;
    pingSaveData: (callback: () => void) => void;
    pingSaveAsData: (callback: () => void) => void;
    createNewFile: () => FileData;
    newWindow: () => void;
    openFile: () => FileData;
    saveFile: (fileData: FileData) => void;
    saveFileAs: (fileData: FileData) => void;
    exitWindow: () => void;
    saveFileData: (fileData: FileData) => void;
    saveFileAsData: (fileData: FileData) => void;
}