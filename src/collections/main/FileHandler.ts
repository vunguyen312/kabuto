import { BrowserView, BrowserWindow, dialog, WebContentsView } from 'electron';
import * as fs from 'fs';
import FileData from '../../types/fileData';

export default class FileHandler {
    static async openFileMenu(): Promise<FileData> {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        }).catch((err) => console.error(err));

        if (!result || result.canceled) return null;

        const [filePath] = result.filePaths;
        const content = fs.readFileSync(filePath, 'utf-8')
                          .replace(/\r/g, '');
        return { path: filePath, content: content };
    }

    static async createFileDialog(fileData: FileData): Promise<FileData> {
        const result = await dialog
            .showSaveDialog({})
            .catch((err) => console.error(err));

        if (!result || result.canceled) return null;

        const { filePath } = result;
        fs.writeFile(filePath, fileData.content, (err) => console.error(err));
        return { path: filePath, content: fileData.content };
    }

    static async verifyFile(fileData: FileData): Promise<boolean> {
        const { path } = fileData;
        return fs.existsSync(path);
    }

    static async saveFile(fileData: FileData): Promise<void> {
        console.log("Successfully saved file data");
        const { path, content } = fileData;
        //TODO: Add error catch if file location differs from one saved
        fs.writeFile(path, content, (err) => console.log(err));
    }
}