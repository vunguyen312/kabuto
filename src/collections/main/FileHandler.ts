import { BrowserView, BrowserWindow, dialog, WebContentsView } from 'electron';
import * as fs from 'fs';
import FileData from '../../types/fileData';

export default class FileHandler {
    static async openFileMenu() {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        }).catch((err) => console.error(err));

        if (!result || result.canceled) return null;

        const [filePath] = result.filePaths;
        const content = fs.readFileSync(filePath, 'utf-8')
                          .replace(/\r/g, '');
        return { path: filePath, content: content };
    }

    static async createFileDialog(fileData: FileData) {
        const result = await dialog
            .showSaveDialog({})
            .catch((err) => console.error(err));

        if (!result || result.canceled) return null;

        const { filePath } = result;
        fs.writeFileSync(filePath, fileData.content);
        return { path: filePath, content: fileData.content };
    }

    static async verifyFile(fileData: FileData): Promise<boolean> {
        const { path } = fileData;
        return fs.existsSync(path);
    }

    static sendFileData(window: any, fileData: FileData): void {
        window.webContents.send("send-file-data", fileData);
    }

    static pingSaveData(window: any): void {
        window.webContents.send('ping-save-data');
    }

    static pingSaveAsData(window: any): void {
        window.webContents.send('ping-save-as-data');
    }

    static saveFileData(fileData: FileData): void {
        console.log("Successfully saved file data");
        const { path, content } = fileData;
        fs.writeFileSync(path, content);
    }
}