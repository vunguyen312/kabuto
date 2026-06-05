export type MenuActionId =
    'file:new' |
    'window:new' |
    'file:open' |
    'file:save' |
    'file:saveas' |
    'window:exit' |
    'edit:undo' |
    'edit:redo' |
    'edit:cut' |
    'edit:copy' |
    'edit:paste' |
    'selection:all' |
    'view:run' |
    'terminal:new' |
    'terminal:window' |
    'terminal:task' |
    'help:documentation' |
    'help:license' |
    'help:about';

export default interface menuItem {
    display: string,
    shortcut: string,
    action: MenuActionId
}
