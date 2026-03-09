import MenuItem from '../../../types/menuItem';
import MenuDefinition from './MenuDefinition';

export default class Menu {
    private loadFileContent: Function;
    private getFileData: Function;
    private navButtons: HTMLCollectionOf<Element>;
    private activeMenu: string;
    private sectionDivs: Map<string, HTMLDivElement>;
    private menuSections: Map<string, MenuItem[]>;
    private readonly functionMap = new Map([
            ['file:new', async () => await this.createNewFile()],
            ['window:new', this.newWindow],
            ['file:open', async () => await this.openFile()],
            ['file:save', async () => await this.saveFile()],
            ['file:saveas', async () => await this.saveFileAs()],
            ['window:exit', this.exitWindow],
            ['edit:undo', () => 1],
            ['edit:redo', () => 1],
            ['edit:cut', () => 1],
            ['edit:copy', () => 1],
            ['edit:paste', () => 1],
            ['selection:all', () => 1],
            ['view:run', () => 1],
            ['terminal:new', () => 1],
            ['terminal:window', () => 1],
            ['terminal:task', () => 1],
            ['help:documentation', () => 1],
            ['help:license', () => 1],
            ['help:about', () => 1]
        ]);

    //i could lowkey put this all into one giant object and build it from there
    //  kinda like the old menu but like thats tomorrows problem
    constructor(loadFileContent: Function, getFileData: Function) {
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

    createSectionDivs(): Map<string, HTMLDivElement> {
        const sectionDivs = new Map();

        for (const navButton of this.navButtons) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'dropdown-content';
            sectionDiv.id = `${navButton.id}`;
            
            navButton.after(sectionDiv);
            navButton.addEventListener('click', () => 
                this.toggleVisible(sectionDiv));
            sectionDivs.set(navButton.id, sectionDiv);
        }

        return sectionDivs;
    }

    //making a function for each section is so chopped
    createSectionMenu(sectionID: string): void {
        const dropdown = this.sectionDivs.get(sectionID);
        const sectionContent = this.menuSections.get(sectionID);

        for (const menuItem of sectionContent) {
            const action = this.functionMap.get(menuItem.action);
            this.createMenuItem(menuItem.display, menuItem.shortcut, 
                                action, dropdown);
        }
    }

    createMenuItem(display: string, shortcut: string, 
                   action: Function, 
                   parent: HTMLDivElement): void {
        const newMenuItem = document.createElement('a');
        newMenuItem.className = 'dropdown-item';
        newMenuItem.href = '#';
        newMenuItem.textContent = display;
        newMenuItem.addEventListener('click', () => {
            this.toggleVisible(parent);
            action();
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
            this.toggleVisible(this.sectionDivs.get(this.activeMenu));
        }

        if (currentDisplay === 'none') {
            section.style.display = 'grid';
            this.activeMenu = section.id;
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