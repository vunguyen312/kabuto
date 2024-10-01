import { dialog } from 'electron';
import * as fs from 'fs';

export const openFileMenu = async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });
  
    if (!result.canceled) {
      const file = result.filePaths[0];
      const content = fs.readFileSync(file, 'utf-8');
      return content;
    }
  
    return null;
}