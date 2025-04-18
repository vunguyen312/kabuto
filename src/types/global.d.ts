import ElectronAPI from './electronAPI';

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
