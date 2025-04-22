import './index.css';
import Editor from './Editor';
import GapBuffer from './collections/GapBuffer';
import FileData from './types/fileData';
import Stats from "./types/stats";

class Renderer {
    private title: HTMLTitleElement;
    private text: HTMLTextAreaElement;
    private output: HTMLDivElement;
    private lineNumbers: HTMLTextAreaElement;
    private statTrackers: Stats;
    private gapBuffer: GapBuffer;
    private editor: Editor;

    constructor(){
        this.title = document.querySelector('title') as HTMLTitleElement;
        this.text = document.getElementById('text-input') as HTMLTextAreaElement;
        this.output = document.getElementById('output') as HTMLDivElement;
        this.lineNumbers = document.getElementById('line-numbers') as HTMLTextAreaElement;

        this.statTrackers = {
            ln: document.getElementById('ln') as HTMLSpanElement,
            col: document.getElementById('col') as HTMLSpanElement,
            char: document.getElementById('char') as HTMLSpanElement,
            totalLn: document.getElementById('totalLn') as HTMLSpanElement
        }

        this.gapBuffer = new GapBuffer("");
        this.editor = new Editor(this.text, this.lineNumbers, this.statTrackers, this.gapBuffer.getGapLeft());
    }

    initializeEditor(): void {
        this.editor.updateEditorText(this.gapBuffer, this.output);
        this.editor.setLineNumbers();
        this.setEventListeners();

        window.electron.receiveFileData((e: Event, fileData: FileData) => this.loadFileContent(e, fileData));
        window.electron.pingSaveData(() => window.electron.saveFileData({ path: this.editor.filePath, content: this.text.value }));
        window.electron.pingSaveAsData(() => window.electron.saveFileAsData({ path: this.editor.filePath, content: this.text.value }));
    }

    setEventListeners(): void {
        //this.text.addEventListener('input', () => this.listenForInput());
        this.text.addEventListener('keydown', (e: KeyboardEvent) => this.listenForKeystrokes(e));
        this.text.addEventListener('click', () => this.editor.getStats());
        this.text.addEventListener('scroll', () => this.editor.syncScroll(this.output));
    }

    //listenForInput(): void {
    //    this.editor.handleLineNumber(this.text);
    //    this.editor.getStats();
    //}

    listenForKeystrokes(e: KeyboardEvent): void {
        //this.editor.handleLineNumber(this.text);
        //this.editor.getStats();
        e.preventDefault();
        this.editor.handleUndo(e, this.text);
        //Cursor pos refers to GapBuffer's gap
        const cursorPos = this.gapBuffer.getCursorPos();
        //Caret pos refers to visual cursor on the editor
        const caretPos = this.editor.getCaretPosition();

        //Might move all this key stuff to the editor class later
        switch(e.key){
            case "Enter":
                this.editor.handleEnter(cursorPos, this.gapBuffer);
                break;
            case "Backspace":
                this.editor.handleBackspace(cursorPos, this.gapBuffer, caretPos);
                break;
            case "Tab":
                this.editor.handleTab(cursorPos, this.gapBuffer, caretPos);
                break;
            case "ArrowRight":
                this.editor.handleRightArrow(cursorPos, this.gapBuffer, caretPos);
                break;
            case "ArrowUp":
                //this.handleRightArrow(cursorPos);
                break;
            case "ArrowLeft":
                this.editor.handleLeftArrow(cursorPos, this.gapBuffer, caretPos);
                break;
            case "ArrowDown":
                //this.handleRightArrow(cursorPos);
                break;
            default:
                if(e.key.length !== 1) return;
                this.editor.handleInput(cursorPos, this.gapBuffer, e, caretPos);
                break;
        }

        this.editor.updateEditorText(this.gapBuffer, this.output);
        this.editor.getStats();
    }

    //TODO: Add compability with the GapBuffer
    loadFileContent(e: Event, fileData: FileData): void {
        this.text.value = fileData.content;
        this.editor.filePath = fileData.path;

        this.editor.setLineNumbers();
        this.editor.updateEditorText(this.gapBuffer, this.output);
        this.editor.getStats();
        this.title.textContent = `Simple Text Editor - ${this.editor.filePath}`;
    }
}

const renderer = new Renderer();

renderer.initializeEditor();

