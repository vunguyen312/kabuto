import './styles/index.css';
import Editor from './collections/renderer/editor/Editor';
import Menu from './collections/renderer/menu/Menu';
import type Stats from "./collections/renderer/types";
import type FileData from './shared/fileData';

export default class Renderer {
    private text: HTMLTextAreaElement;
    private lineNumbers: HTMLDivElement;
    private statTrackers: Stats;
    private editors: Editor[];
    private menu: Menu;

    constructor(){
        this.text = document
            .getElementById('text-input') as HTMLTextAreaElement;
        this.lineNumbers = document
            .getElementById('line-numbers') as HTMLDivElement;

        this.statTrackers = {
            ln: document.getElementById('ln') as HTMLSpanElement,
            col: document.getElementById('col') as HTMLSpanElement,
            char: document.getElementById('char') as HTMLSpanElement,
            totalLn: document.getElementById('totalLn') as HTMLSpanElement
        }

        this.editors = [new Editor(this.text, this.lineNumbers, 
                                 this.statTrackers)];
        this.menu = new Menu((fileData: FileData) => 
                                this.editors[0].loadFileContent(fileData),
                             this.editors[0].getFileData);
    }
}

new Renderer();
