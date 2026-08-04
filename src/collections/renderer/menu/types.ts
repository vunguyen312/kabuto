export type MenuActionId =
    'file:new' |
    'window:new' |
    'file:open' |
    'file:save' |
    'file:saveas' |
    'window:exit' ;

export type MenuSectionId =
    'file';

export default interface MenuItem {
    display: string;
    shortcut: string;
    action: MenuActionId;
}
