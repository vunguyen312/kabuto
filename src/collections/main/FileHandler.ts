import { dialog } from 'electron';
import * as fs from 'fs';
import type FileData from '../../shared/fileData';

export default class FileHandler {
    static async openFileMenu(): Promise<FileData | null> {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        }).catch((err) => console.error(err));

        if (!result || result.canceled) return null;

        const [filePath] = result.filePaths;
        const content = fs.readFileSync(filePath, 'utf-8')
                          .replace(/\r/g, '');
        return { path: filePath, content: content };
    }

    static async createFileDialog(fileData: FileData): Promise<FileData | null> {
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
        if (!path) return false;
        return fs.existsSync(path);
    }

    static async saveFile(fileData: FileData): Promise<void> {
        console.log("Successfully saved file data");
        const { path, content } = fileData;
        if (!path) return;
        //TODO: Add error catch if file location differs from one saved
        fs.writeFile(path, content, (err) => console.log(err));
    }
}
