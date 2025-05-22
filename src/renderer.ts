import './index.css';
import Editor from './Editor';
import GapBuffer from './collections/GapBuffer';
import Controller from './Controller';
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
    private controller: Controller;

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
        this.controller = new Controller(this.editor, this.gapBuffer);
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
        this.text.addEventListener('keydown', (e: KeyboardEvent) => this.controller.listenForKeystrokes(e, this.text, this.output));
        this.text.addEventListener('click', () => this.editor.getStats());
        this.text.addEventListener('scroll', () => this.editor.syncScroll(this.output));
    }

    //listenForInput(): void {
    //    this.editor.handleLineNumber(this.text);
    //    this.editor.getStats();
    //}

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