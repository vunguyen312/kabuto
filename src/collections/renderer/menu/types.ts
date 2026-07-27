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
    'edit:paste';

export type MenuSectionId =
    'file' | 'edit';

export default interface MenuItem {
    display: string;
    shortcut: string;
    action: MenuActionId;
}
