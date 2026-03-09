import FileData from "./fileData";

export default interface ElectronAPI {
    createNewFile: () => FileData;
    newWindow: () => void;
    openFile: () => FileData;
    saveFile: (fileData: FileData) => void;
    saveFileAs: (fileData: FileData) => void;
    exitWindow: () => void;
}