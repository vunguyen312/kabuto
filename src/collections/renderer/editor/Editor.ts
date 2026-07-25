import GapBuffer from "./GapBuffer";
import Stats from "../../../types/stats";
import FileData from '../../../types/fileData';
import Controller from './Controller';

export default class Editor {
    private text: HTMLTextAreaElement;
    private title: HTMLTitleElement;
    private lineNumbers: HTMLDivElement;
    private currentRowCount: number;
    private prevRowCount: number;
    private lnTracker: HTMLSpanElement;
    private colTracker: HTMLSpanElement;
    private charTracker: HTMLSpanElement;
    private totalLnTracker: HTMLSpanElement;
    private gapBuffer: GapBuffer;
    private output: HTMLDivElement;
    private controller: Controller;
    public filePath: string | undefined;

    constructor(text: HTMLTextAreaElement, lineNumbers: HTMLDivElement, 
                stats: Stats) {
        this.text = text;
        this.gapBuffer = new GapBuffer('');
        this.output = document.getElementById('output') as HTMLDivElement;
        this.title = document.querySelector('title') as HTMLTitleElement;
        this.lineNumbers = lineNumbers;
        this.currentRowCount = 0;
        this.prevRowCount = 0;
        this.controller = new Controller(this, this.gapBuffer);
        this.filePath = '';

        //Stats
        this.currentRowCount = text.value.split('\n').length;
        this.lnTracker = stats.ln;
        this.colTracker = stats.col;
        this.charTracker = stats.char;
        this.totalLnTracker = stats.totalLn;

        //Initialize
        this.init();
    }

    public init(): void {
        this.updateEditorText();
        this.setLineNumbers();
        this.setEventListeners();
        this.controller.init(this.text);
    }

    setEventListeners(): void {
        this.text.addEventListener('scroll', () => 
            this.syncScroll(this.output));
    }
    
    setLineNumbers(): void {
        this.prevRowCount = this.text.value.split('\n').length;
        let lineNumbers = '';
        for (let i = 1; i <= this.prevRowCount; i++) {
            lineNumbers += `${i}\n`;
        }
        this.lineNumbers.textContent = lineNumbers;
        this.currentRowCount = this.prevRowCount;
        console.log(this.currentRowCount, 'set');
    }

    addSingleLineNumber(): void {
        this.prevRowCount = this.currentRowCount;
        this.currentRowCount++;
        this.lineNumbers.textContent += `${this.currentRowCount}`;
        this.lineNumbers.textContent += '\n';
    }

    removeSingleLineNumber(): void {
        if (this.lineNumbers.textContent.length <= 2) return;

        let currIndex = this.lineNumbers.textContent.length - 1;
        const lastRow = this.lineNumbers.textContent[currIndex];

        if (lastRow === '\n') {
            currIndex--;
        }

        while (this.lineNumbers.textContent[currIndex] !== '\n') {
            currIndex--;
        }

        this.lineNumbers.textContent = this.lineNumbers.textContent
            .substring(0, currIndex + 1);
        this.prevRowCount = this.currentRowCount;
        this.currentRowCount--;
    }

    handleUndo(e: KeyboardEvent, text: HTMLTextAreaElement): void {
        if (e.key !== 'Ctrl' && e.key !== 'z') return;
        this.prevRowCount = text.value.split('\n').length;
        //this.handleLineNumber(text);
    }

    tokenize(text: HTMLTextAreaElement): string[] {
        const regex = /(\bconst\b|\blet\b|\bvar\b|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bfunction\b|\breturn\b|\bclass\b|\bimport\b|\bexport\b|\basync\b|\bawait\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(\.\d+)?\b|\/\/.*?$|\/\*[\s\S]*?\*\/|[()[\]{}]|[+\-*/%=&|^~<>!;.]=?|&&|\|\|)/gm;
        //Split JavaScript keywords into tokens.
        //TODO: Get this from JSON so other languages can be supported.
        return text.value
            .split(regex)
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
        const remainingText = this.text.value.substring(0, selectionStart);
        return remainingText.split('\n').length;
    }

    //Optimize this using a loop which counts backwards. Current 
    // implementation very inefficient
    getCurrCol(): number {
        const selectionStart = this.text.selectionStart;
        const textBeforeCursor = this.text.value.substring(0, selectionStart);
        //The length of a substring made from the last selected line to 
        // the cursor is technically the current column.
        const currentRow = textBeforeCursor
            .split('\n')
            .pop() || '';
        return currentRow.length + 1;
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
        const totalLn = this.currentRowCount;
        this.updateStatDisplay(row, col, char, totalLn);
    }

    setCursorAndCaret(gapBuffer: GapBuffer, cursorPos: number): void {
        gapBuffer.moveCursor(cursorPos);
    }

    updateEditorText(): void {
        const gapLeft = this.gapBuffer.getGapLeft();
        this.text.value = this.gapBuffer.toString();
        this.text.setSelectionRange(gapLeft, gapLeft);
        this.highlight(this.text, this.output);
    }

    loadFileContent(fileData: FileData): void {
        this.filePath = fileData.path;
        this.title.textContent = `Zector Editor - ${this.filePath}`;
        
        this.gapBuffer.loadText(fileData.content);
        this.updateEditorText();
        this.setLineNumbers();
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
