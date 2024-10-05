import { dialog } from 'electron';
import * as fs from 'fs';

export const openFileMenu = async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  }).catch((err) => console.error(err));

  if (!result || result.canceled) return null;

  const file = result.filePaths[0];
  const content = fs.readFileSync(file, 'utf-8');
  return { path: file, content: content };
}

export const createFileMenu = async (fileData: FileData): Promise<void> => {
  const result = await dialog
  .showSaveDialog({})
  .catch((err) => console.error(err));

  if (!result || result.canceled) return null;

  const { filePath } = result;
  fs.writeFileSync(filePath, fileData.content);
}

export const verifyFile = (fileData: FileData): boolean => {
  const { path } = fileData;
  return fs.existsSync(path);
}

export const sendFileData = (window: any, fileData: FileData) => {
  window.webContents.send("send-file-data", fileData);
}

export const pingSaveData = (window: any) => {
  window.webContents.send('ping-save-data');
}

export const pingSaveAsData = (window: any) => {
  window.webContents.send('ping-save-as-data');
}

export const saveFileData = (fileData: FileData) => {
  console.log("Successfully saved file data");
  const { path, content } = fileData;
  fs.writeFileSync(path, content);
}