import type MenuItem from './types';
import type { MenuSectionId } from './types';

export default class MenuDefinition {
    public static create(): Map<MenuSectionId, MenuItem[]> {
        return new Map([
            ['file', [
                { 
                    display: 'New File...', 
                    shortcut: 'Ctrl+N', 
                    action: 'file:new' 
                }, 
                { 
                    display: 'New Window', 
                    shortcut: 'Ctrl+Shift+N', 
                    action: 'window:new'
                }, 
                { 
                    display: 'Open File...', 
                    shortcut: 'Ctrl+O', 
                    action: 'file:open'
                }, 
                { 
                    display: 'Save', 
                    shortcut: 'Ctrl+S', 
                    action: 'file:save'
                }, 
                { 
                    display: 'Save As...', 
                    shortcut: 'Ctrl+Shift+S', 
                    action: 'file:saveas'
                }, 
                { 
                    display: 'Exit', 
                    shortcut: 'Alt+F4', 
                    action: 'window:exit'
                }
            ]],
            ['edit', [
                { 
                    display: 'Undo', 
                    shortcut: 'Ctrl+Z', 
                    action: 'edit:undo'
                },
                { 
                    display: 'Redo', 
                    shortcut: 'Ctrl+Y', 
                    action: 'edit:redo'
                },
                { 
                    display: 'Cut', 
                    shortcut: 'Ctrl+X', 
                    action: 'edit:cut'
                },
                { 
                    display: 'Copy', 
                    shortcut: 'Ctrl+C', 
                    action: 'edit:copy'
                },
                { 
                    display: 'Paste', 
                    shortcut: 'Ctrl+V', 
                    action: 'edit:paste'
                }
            ]],
        ]);
    }
}