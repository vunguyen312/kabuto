import { app, Menu, MenuItemConstructorOptions } from 'electron';
import { openFileMenu, createFileMenu, sendFileData, pingSaveData, pingSaveAsData } from './fileHandler';

const isMac = process.platform === 'darwin'

const menuTemplate: any = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                click: async () => {
                    await createFileMenu({ path: null, content: '' }); 
                }
            },
            {
                type: 'separator'
            },
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
                type: 'separator'
            },
            {
                label: "Save",
                click: async (menuItem: any, browserWindow: Window) => {
                    pingSaveData(browserWindow);
                }
            },
            {
                label: "Save As",
                click: async (menuItem: any, browserWindow: Window) => {
                    pingSaveAsData(browserWindow);
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