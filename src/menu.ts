import { app, Menu, MenuItemConstructorOptions } from 'electron';
import { openFileMenu } from './fileHandler';
import { loadFile } from './renderer';

const isMac = process.platform === 'darwin'

const menuTemplate: any = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open File',
                click: async () => {
                    const result = await openFileMenu();
                    loadFile(result);
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