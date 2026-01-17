import MenuItem from '../../types/menuItem';

export default class Menu {
    private navButtons: HTMLCollectionOf<Element>;
    private activeMenu: string;
    private sectionDivs: Map<string, HTMLDivElement>;
    private fileDiv: HTMLDivElement;
    private fileContent: MenuItem[];
    private editContent: MenuItem[];
    private selectionContent: MenuItem[];
    private viewContent: MenuItem[];
    private terminalContent: MenuItem[];
    private helpContent: MenuItem[];
    private sectionToContent: Map<string, MenuItem[]>

    //i could lowkey put this all into one giant object and build it from there kinda like the old menu but like
    //thats tomorrows problem
    constructor() {
        this.activeMenu = '';
        this.navButtons = document.getElementsByClassName('nav-button');
        this.sectionDivs = this.createSectionDivs();
        this.fileContent = [
            { display: 'New File...', shortcut: 'Ctrl+N', action: () => {console.log('placeholder')} }, 
            { display: 'New Window', shortcut: 'Ctrl+Shift+N', action: () => {console.log('placeholder')} }, 
            { display: 'Open File...', shortcut: 'Ctrl+O', action: () => {console.log('placeholder')} }, 
            { display: 'Save', shortcut: 'Ctrl+S', action: () => {console.log('placeholder')} }, 
            { display: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => {console.log('placeholder')} }, 
            { display: 'Exit', shortcut: 'Alt+F4', action: () => {console.log('placeholder')} }
        ];
        this.editContent = [
            { display: 'Undo', shortcut: 'Ctrl+Z', action: () => {console.log('placeholder')} },
            { display: 'Redo', shortcut: 'Ctrl+Y', action: () => {console.log('placeholder')} },
            { display: 'Cut', shortcut: 'Ctrl+X', action: () => {console.log('placeholder')} },
            { display: 'Copy', shortcut: 'Ctrl+C', action: () => {console.log('placeholder')} },
            { display: 'Paste', shortcut: 'Ctrl+V', action: () => {console.log('placeholder')} }
        ];
        this.selectionContent = [
            { display: 'Select All', shortcut: 'Ctrl+A', action: () => {console.log('placeholder')} }
        ];
        this.viewContent = [
            { display: 'Run', shortcut: 'Ctrl+Shift+D', action: () => {console.log('placeholder')} }
        ];
        this.terminalContent = [
            { display: 'New Terminal', shortcut: 'Ctrl+Shift+`', action: () => {console.log('placeholder')} },
            { display: 'New Terminal Window', shortcut: 'Ctrl+Alt+`', action: () => {console.log('placeholder')} },
            { display: 'Run Task...', shortcut: '', action: () => {console.log('placeholder')} }
        ];
        this.helpContent = [
            { display: 'Documentation', shortcut: '', action: () => {console.log('placeholder')} },
            { display: 'View License', shortcut: '', action: () => {console.log('placeholder')} },
            { display: 'About', shortcut: '', action: () => {console.log('placeholder')} }
        ];
        this.sectionToContent = new Map([
            ['file', this.fileContent],
            ['edit', this.editContent],
            ['selection', this.selectionContent],
            ['view', this.viewContent],
            ['terminal', this.terminalContent],
            ['help', this.helpContent]
        ]);

        this.initializeNavBar();
    }

    initializeNavBar(): void {
        this.createSectionMenu('file');
        this.createSectionMenu('edit');
        this.createSectionMenu('selection');
        this.createSectionMenu('view');
        this.createSectionMenu('terminal');
        this.createSectionMenu('help');
    }

    createSectionDivs(): Map<string, HTMLDivElement> {
        const sectionDivs = new Map();

        for(const navButton of this.navButtons) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'dropdown-content';
            sectionDiv.id = `${navButton.id}`;
            
            navButton.after(sectionDiv);
            navButton.addEventListener('click', () => this.toggleVisible(sectionDiv));
            sectionDivs.set(navButton.id, sectionDiv);
        }

        return sectionDivs;
    }

    //making a function for each section is so chopped
    createSectionMenu(sectionID: string): void {
        const dropdown = this.sectionDivs.get(sectionID);
        const sectionContent = this.sectionToContent.get(sectionID);

        for(const menuItem of sectionContent) 
            this.createMenuItem(menuItem.display, menuItem.shortcut, dropdown);
    }

    createMenuItem(display: string, shortcut: string, parent: HTMLDivElement): void {
        const newMenuItem = document.createElement('a');
        newMenuItem.className = 'dropdown-item';
        newMenuItem.href = '#';
        newMenuItem.textContent = display;
        
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

        if(this.activeMenu !== section.id && this.activeMenu !== ''){
            this.toggleVisible(this.sectionDivs.get(this.activeMenu));
        }

        if(currentDisplay === 'none') {
            section.style.display = 'grid';
            this.activeMenu = section.id;
            return;
        }
        section.style.display = 'none';
        this.activeMenu = '';
    }
}