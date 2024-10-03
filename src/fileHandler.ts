import { dialog } from 'electron';
import * as fs from 'fs';

export const openFileMenu = async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    }).catch((err) => console.error(err));
  
    if (result && !result.canceled) {
      const file = result.filePaths[0];
      const content = fs.readFileSync(file, 'utf-8');
      return content;
    }
  
    return null;
}

export const sendFileData = (window: any, fileData: string) => {
  window.webContents.send("send-file-data", fileData);
}