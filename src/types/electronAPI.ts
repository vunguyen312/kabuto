import FileData from "./fileData";

export default interface ElectronAPI {
    createNewFile: () => Promise<FileData | null>;
    newWindow: () => Promise<void>;
    openFile: () => Promise<FileData | null>;
    saveFile: (fileData: FileData) => Promise<void>;
    saveFileAs: (fileData: FileData) => Promise<FileData | null>;
    exitWindow: () => Promise<void>;
}
