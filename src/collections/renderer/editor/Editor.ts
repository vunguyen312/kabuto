import GapBuffer from "./GapBuffer";
import type Stats from "../types";
import type FileData from '../../../shared/fileData';
import Controller from './Controller';

export default class Editor {
    private text: HTMLTextAreaElement;
    private title: HTMLTitleElement;
    private lineNumbers: HTMLDivElement;
    private lineCount: number;
    private lnTracker: HTMLSpanElement;
    private colTracker: HTMLSpanElement;
    private charTracker: HTMLSpanElement;
    private totalLnTracker: HTMLSpanElement;
    private gapBuffer: GapBuffer;
    private output: HTMLDivElement;
    private controller: Controller;
    public filePath: string | null;

    constructor(text: HTMLTextAreaElement, lineNumbers: HTMLDivElement, 
                stats: Stats) {
        this.text = text;
        this.gapBuffer = new GapBuffer('');
        this.output = document.getElementById('output') as HTMLDivElement;
        this.title = document.querySelector('title') as HTMLTitleElement;
        this.lineNumbers = lineNumbers;
        this.lineCount = 1;
        this.controller = new Controller(this, this.gapBuffer);
        this.filePath = '';

        //Stats

        this.lnTracker = stats.ln;
        this.colTracker = stats.col;
        this.charTracker = stats.char;
        this.totalLnTracker = stats.totalLn;

        //Initialize
        this.init();
    }

    public init(): void {
        this.updateEditorText(true);
        this.controller.init(this.text);
    }

    setEventListeners(): void {
        this.text.addEventListener('scroll', () => 
            this.syncScroll(this.output));
    }
    
    private countLines(content: string): number {
        let newlineCount = 1;
        for (let i = 0; i < content.length; i++) {
            if (content[i] === '\n') {
                newlineCount++;
            }
        }

        return newlineCount;
    }

    private createLineNumber(): HTMLSpanElement {
        const lineNumber = document.createElement('span');
        lineNumber.className = 'line-number';
        return lineNumber;
    }
    
    public addLineNumbers(count: number): void {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const lineNumber = this.createLineNumber();
            fragment.appendChild(lineNumber);
        }
        this.lineNumbers.appendChild(fragment);
        this.lineCount += count;
    }

    public removeLineNumbers(count: number): void {
        for (let i = 0; i < count; i++) {
            if (this.lineNumbers.childElementCount <= 1) {
                return;
            }

            const lastLineNumber = this.lineNumbers.lastElementChild;
            if (!lastLineNumber) {
                return;
            }
            this.lineNumbers.removeChild(lastLineNumber);
        }
        this.lineCount -= count;
    }

    private syncLineNumbers(content: string): void {
        const desiredLineCount = this.countLines(content);
        const lineDelta = desiredLineCount - this.lineNumbers.childElementCount;

        if (lineDelta > 0) {
            this.addLineNumbers(lineDelta);
        } else if (lineDelta < 0) {
            this.removeLineNumbers(-lineDelta);
        }

        this.lineCount = desiredLineCount;
    }

    tokenize(text: HTMLTextAreaElement): string[] {
        const regex = /(\bconst\b|\blet\b|\bvar\b|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bfunction\b|\breturn\b|\bclass\b|\bimport\b|\bexport\b|\basync\b|\bawait\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(\.\d+)?\b|\/\/.*?$|\/\*[\s\S]*?\*\/|[()[\]{}]|[+\-*/%=&|^~<>!;.]=?|&&|\|\|)/gm;
        //Split JavaScript keywords into tokens.
        //TODO: Get this from JSON so other languages can be supported.
        return text.value.split(regex)
                         .filter(token => token);
    }

    escapeHtml(unsafe: string): string {
        const escapeMap: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
    
        return unsafe.replace(/[&<"'>]/g, (match) => escapeMap[match]);
    }

    //TODO: Optimize and add support for other languages.
    highlight(text: HTMLTextAreaElement, output: HTMLDivElement): void {
        const keywords = /\b(const|let|var|if|else|for|while|function|return|class|import|export|async|await)\b/g;
        const strings = /"(.*?)"|'(.*?)'|`(.*?)`/;
        const numbers = /\b\d+(\.\d+)?\b/g;
        const singleLineComments = /\/\/.*?$/gm;
        const multiLineComments = /\/\*[\s\S]*?\*\//g;
        const brackets = /[()[\]{}]/g;
        const operators = /[+\-*/%=&|^~<>!;.]=?|&&|\|\|/g;
        
        const tokens = this.tokenize(text);
    
        //sorry if u went into cardiac arrest reading this
        for (let i = 0; i < tokens.length; i++) {
            //Add a space to the end of the last token if it's a newline.
            //Mostly just to catch the edge case of line breaks being placed
            //simultaneously.
            if (i === tokens.length - 1 && tokens[i].match(/\n/g) ) {
                tokens[i] += ' ';
            }

            const escapedToken = this.escapeHtml(tokens[i]);

            //We don't want other tokens inside of comments to be highlighted.
            if (singleLineComments.test(tokens[i])) {
                tokens[i] = `<span class="comment">${escapedToken}</span>`;
                continue;
            }
            if (multiLineComments.test(tokens[i])) {
                tokens[i] = `<span class="comment">${escapedToken}</span>`;
                continue;
            }

            if (keywords.test(tokens[i])) {
                tokens[i] = `<span class="keyword">${escapedToken}</span>`;
                continue;
            }
            
            if (strings.test(tokens[i])) {
                tokens[i] = `<span class="string">${escapedToken}</span>`;
                continue;
            }
            
            if (numbers.test(tokens[i])) {
                tokens[i] = `<span class="number">${escapedToken}</span>`;
                continue;
            }

            if (tokens[i].match(brackets)) {
                tokens[i] = `<span class="bracket">${escapedToken}</span>`;
                continue;
            }

            if (tokens[i].match(operators)) {
                tokens[i] = `<span class="operator">${escapedToken}</span>`;
                continue;
            }
        }
        
        output.innerHTML = tokens.join('');
    }

    syncScroll(output: HTMLDivElement): void {
        this.lineNumbers.scrollTop = this.text.scrollTop;
        output.scrollTop = this.text.scrollTop;
        output.scrollLeft = this.text.scrollLeft;
    }

    getCurrRow(): number {
        const selectionStart = this.text.selectionStart;
        const content = this.text.value;
        let row = 1;

        for (let i = 0; i < selectionStart; i++) {
            if (content[i] === '\n') {
                row++;
            }
        }

        return row;
    }

    getCurrCol(): number {
        const selectionStart = this.text.selectionStart;
        const content = this.text.value;
        let col = 1;

        for (let i = selectionStart - 1;
             i >= 0 && content[i] !== '\n'; i--) {
            col++;
        }

        return col;
    }

    getCharCount(): number {
        return this.text.value.length;
    }
    
    updateStatDisplay(row: number, col: number, 
                      char: number, totalLn: number): void {
        this.lnTracker.textContent = `Ln: ${row.toString()},`;
        this.colTracker.textContent = `Col: ${col.toString()}`;
        this.charTracker.textContent = `${char.toString()} characters,`;
        this.totalLnTracker.textContent = `${totalLn} lines`;
    }

    getStats(): void {
        const row = this.getCurrRow();
        const col = this.getCurrCol();
        const char = this.getCharCount();
        const totalLn = this.lineCount;
        this.updateStatDisplay(row, col, char, totalLn);
    }

    setCursorAndCaret(gapBuffer: GapBuffer, cursorPos: number): void {
        gapBuffer.moveCursor(cursorPos);
    }

    updateEditorText(shouldSyncLineNumbers: boolean): void {
        const content = this.gapBuffer.toString();
        this.text.value = content;
        const gapLeft = this.gapBuffer.getGapLeft();
        this.text.setSelectionRange(gapLeft, gapLeft);

        // For undo/redo
        if (shouldSyncLineNumbers) {
            this.syncLineNumbers(content);
        }

        this.highlight(this.text, this.output);
    }

    loadFileContent(fileData: FileData): void {
        this.filePath = fileData.path;
        this.title.textContent = `Zector Editor - ${this.filePath}`;
        
        this.gapBuffer.loadText(fileData.content);
        this.updateEditorText(true);
        
        this.getStats();
    }

    getFileData = (): FileData => {
        const fileData = {
            path: this.filePath,
            content: this.text.value
        };

        return fileData;
    }
}
