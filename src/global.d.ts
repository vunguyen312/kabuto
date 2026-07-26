import type ElectronAPI from './shared/electronAPI';

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
