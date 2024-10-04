import { app, Menu, MenuItemConstructorOptions } from 'electron';
import { openFileMenu, sendFileData, pingSaveData } from './fileHandler';

const isMac = process.platform === 'darwin'

const menuTemplate: any = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open File',
                click: async (menuItem: any, browserWindow: Window) => {
                    const result = await openFileMenu(); 
                    if (result && browserWindow) {
                        sendFileData(browserWindow, result);
                    }
                }
            },
            {
                label: "Save File",
                click: async (menuItem: any, browserWindow: Window) => {
                    pingSaveData(browserWindow);
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { type: 'separator' },
            ...(isMac ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
            ] : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
            ])
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
        ]
    },
];

export default Menu.buildFromTemplate(menuTemplate);