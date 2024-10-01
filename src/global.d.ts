type State = {
    textContent: string;
    lineNumber: number;
    prevRowCount: number;
}

interface ElectronAPI {
    openDialog: () => Promise<string>;
}

interface Window {
    electron: ElectronAPI;
}

