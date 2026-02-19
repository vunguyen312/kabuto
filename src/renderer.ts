import './styles/index.css';
import Editor from './collections/renderer/Editor';
import Menu from './collections/renderer/Menu';
import Stats from "./types/stats";
import FileData from './types/fileData';

export default class Renderer {
    private text: HTMLTextAreaElement;
    private lineNumbers: HTMLDivElement;
    private statTrackers: Stats;
    private editor: Editor;
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

        this.editor = new Editor(this.text, this.lineNumbers, 
                                 this.statTrackers);
        this.menu = new Menu((fileData: FileData) => 
                                this.editor.loadFileContent(fileData),
                             this.editor.getFileData);
    }
}

const renderer = new Renderer();