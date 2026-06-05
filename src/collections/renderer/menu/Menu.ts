import MenuItem, { MenuActionId } from '../../../types/menuItem';
import MenuDefinition from './MenuDefinition';
import FileData from '../../../types/fileData';

type LoadFileContent = (fileData: FileData) => void;
type GetFileData = () => FileData;
type MenuAction = () => void | Promise<void>;
export type MenuSectionId = 'file' | 'edit' | 'selection' | 'view' 
                            | 'terminal' | 'help';

export default class Menu {
    private loadFileContent: LoadFileContent;
    private getFileData: GetFileData;
    private navButtons: HTMLCollectionOf<Element>;
    private activeMenu: MenuSectionId | '';
    private sectionDivs: Map<MenuSectionId, HTMLDivElement>;
    private menuSections: Map<MenuSectionId, MenuItem[]>;
    private readonly functionMap: Record<MenuActionId, MenuAction> = {
            'file:new': async () => await this.createNewFile(),
            'window:new': () => this.newWindow(),
            'file:open': async () => await this.openFile(),
            'file:save': async () => await this.saveFile(),
            'file:saveas': async () => await this.saveFileAs(),
            'window:exit': () => this.exitWindow(),
            'edit:undo': () => {},
            'edit:redo': () => {},
            'edit:cut': () => {},
            'edit:copy': () => {},
            'edit:paste': () => {},
            'selection:all': () => {},
            'view:run': () => {},
            'terminal:new': () => {},
            'terminal:window': () => {},
            'terminal:task': () => {},
            'help:documentation': () => {},
            'help:license': () => {},
            'help:about': () => {}
        };

    //i could lowkey put this all into one giant object and build it from there
    //  kinda like the old menu but like thats tomorrows problem
    constructor(loadFileContent: LoadFileContent, getFileData: GetFileData) {
        this.activeMenu = '';
        this.loadFileContent = loadFileContent;
        this.getFileData = getFileData;
        this.navButtons = document.getElementsByClassName('nav-button');
        this.sectionDivs = this.createSectionDivs();
        this.menuSections = MenuDefinition.create();

        this.initializeNavBar();
    }

    initializeNavBar(): void {
        for (const [section] of this.menuSections) {
            this.createSectionMenu(section);
        }
    }

    createSectionDivs(): Map<MenuSectionId, HTMLDivElement> {
        const sectionDivs = new Map<MenuSectionId, HTMLDivElement>();

        for (const navButton of this.navButtons) {
            const sectionID = navButton.id as MenuSectionId;
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'dropdown-content';
            sectionDiv.id = sectionID;
            
            navButton.after(sectionDiv);
            navButton.addEventListener('click', () => 
                this.toggleVisible(sectionDiv));
            sectionDivs.set(sectionID, sectionDiv);
        }

        return sectionDivs;
    }

    //making a function for each section is so chopped
    createSectionMenu(sectionID: MenuSectionId): void {
        const dropdown = this.sectionDivs.get(sectionID)!;
        const sectionContent = this.menuSections.get(sectionID)!;

        for (const menuItem of sectionContent) {
            const action = this.functionMap[menuItem.action];
            this.createMenuItem(menuItem.display, menuItem.shortcut, 
                                action, dropdown);
        }
    }

    createMenuItem(display: string, shortcut: string, 
                   action: MenuAction,
                   parent: HTMLDivElement): void {
        const newMenuItem = document.createElement('a');
        newMenuItem.className = 'dropdown-item';
        newMenuItem.href = '#';
        newMenuItem.textContent = display;
        newMenuItem.addEventListener('click', () => {
            this.toggleVisible(parent);
            void action();
        });

        this.createShortcutDisplay(shortcut, newMenuItem);
        parent.append(newMenuItem);
    }

    createShortcutDisplay(display: string, parent: HTMLAnchorElement): void {
        const newShortcut = document.createElement('span');
        newShortcut.className = 'shortcut';
        newShortcut.textContent = display;

        parent.append(newShortcut);
    }

    toggleVisible(section: HTMLDivElement): void {
        const currentDisplay = section.style.display;

        if (this.activeMenu !== section.id && this.activeMenu !== '') {
            this.toggleVisible(this.sectionDivs.get(this.activeMenu)!);
        }

        if (currentDisplay === 'none') {
            section.style.display = 'grid';
            this.activeMenu = section.id as MenuSectionId | '';
            return;
        }
        section.style.display = 'none';
        this.activeMenu = '';
    }

    async createNewFile(): Promise<void> {
        const result = await window.electron.createNewFile();
        if (result) this.loadFileContent(result);
    }

    async openFile(): Promise<void> {
        const result = await window.electron.openFile();
        if (result) this.loadFileContent(result);
    }

    async saveFile(): Promise<void> {
        const fileData = this.getFileData();
        await window.electron.saveFile(fileData);
    }

    //TODO: change file path in editor
    async saveFileAs(): Promise<void> {
        const fileData = this.getFileData();
        await window.electron.saveFileAs(fileData);
    }

    newWindow(): void {
        window.electron.newWindow();
    }

    exitWindow(): void {
        window.electron.exitWindow();
    }
}
