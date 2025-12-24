import GapBuffer from "./collections/GapBuffer";
import Stats from "./types/stats";

export default class Editor {
    private text: HTMLTextAreaElement;
    private lineNumbers: HTMLTextAreaElement;
    private currentRowCount: number;
    private prevRowCount: number;
    private lnTracker: HTMLSpanElement;
    private colTracker: HTMLSpanElement;
    private charTracker: HTMLSpanElement;
    private totalLnTracker: HTMLSpanElement;
    private caretPosition: number;
    public filePath: string;

    constructor(text: HTMLTextAreaElement, lineNumbers: HTMLTextAreaElement, stats: Stats, caretPosition: number) {
        this.text = text;
        this.lineNumbers = lineNumbers;

        //Stats
        this.currentRowCount = text.value.split('\n').length;
        this.lnTracker = stats.ln;
        this.colTracker = stats.col;
        this.charTracker = stats.char;
        this.totalLnTracker = stats.totalLn;
        this.caretPosition = caretPosition;
    }
    
    setLineNumbers(): void {
        this.prevRowCount = this.text.value.split('\n').length;
        let lineNumbers = '';
        for(let i = 1; i <= this.prevRowCount; i++){
            lineNumbers += `${i}\n`;
        }
        this.lineNumbers.value = lineNumbers;
        console.log(this.currentRowCount, "set");
    }

    addSingleLineNumber(): void {
        this.prevRowCount = this.currentRowCount;
        this.currentRowCount++;
        this.lineNumbers.value += `${this.currentRowCount}`;
        this.lineNumbers.value += '\n';
    }

    removeSingleLineNumber(): void {
        if(this.lineNumbers.value.length <= 2) return;

        let currIndex = this.lineNumbers.value.length - 1;
        const lastRow = this.lineNumbers.value[currIndex];
        //Skipping the first instance of a line break so it doesn't tamper with the loop
        if(lastRow === '\n'){
            currIndex--;
        }

        while(this.lineNumbers.value[currIndex] !== '\n'){
            currIndex--;
        }

        //We want to leave the last line break alone which is it's included in the substring.
        //This is because the line add follows the pattern of {number}\n
        this.lineNumbers.value = this.lineNumbers.value.substring(0, currIndex + 1);
        this.prevRowCount = this.currentRowCount;
        this.currentRowCount--;
    }

    handleUndo(e: KeyboardEvent, text: HTMLTextAreaElement): void {
        if(e.key !== 'Ctrl' && e.key !== 'z') return;
        this.prevRowCount = text.value.split('\n').length;
        //this.handleLineNumber(text);
    }

    tokenize(text: HTMLTextAreaElement): string[] {
        const regex = /(\bconst\b|\blet\b|\bvar\b|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bfunction\b|\breturn\b|\bclass\b|\bimport\b|\bexport\b|\basync\b|\bawait\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(\.\d+)?\b|\/\/.*?$|\/\*[\s\S]*?\*\/|[\(\)\[\]\{\}]|[+\-*/%=&|^~<>!;.]=?|&&|\|\|)/gm;
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
        const brackets = /[\(\)\[\]\{\}]/g;
        const operators = /[+\-*/%=&|^~<>!;.]=?|&&|\|\|/g;
        
        const tokens = this.tokenize(text);
    
        //sorry if u went into cardiac arrest reading this
        for(let i = 0; i < tokens.length; i++){
            //Add a space to the end of the last token if it's a newline.
            //Mostly just to catch the edge case of line breaks being placed
            //simultaneously.
            if(i === tokens.length - 1 && tokens[i].match(/\n/g) ){
                tokens[i] += ' ';
            };

            const escapedToken = this.escapeHtml(tokens[i]);

            //We don't want other tokens inside of comments to be highlighted.
            if(singleLineComments.test(tokens[i])){
                tokens[i] = `<span class="comment">${escapedToken}</span>`;
                continue;
            }
            if(multiLineComments.test(tokens[i])){
                tokens[i] = `<span class="comment">${escapedToken}</span>`;
                continue;
            }

            if(keywords.test(tokens[i])){
                tokens[i] = `<span class="keyword">${escapedToken}</span>`;
                continue;
            }
            
            if(strings.test(tokens[i])){
                tokens[i] = `<span class="string">${escapedToken}</span>`;
                continue;
            }
            
            if(numbers.test(tokens[i])){
                tokens[i] = `<span class="number">${escapedToken}</span>`;
                continue;
            }

            if(tokens[i].match(brackets)){
                tokens[i] = `<span class="bracket">${escapedToken}</span>`;
                continue;
            }

            if(tokens[i].match(operators)){
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

    //Optimize this using a loop which counts backwards. Current implementation very inefficient
    getCurrCol(): number {
        const selectionStart = this.text.selectionStart;
        const textBeforeCursor = this.text.value.substring(0, selectionStart);
        //The length of a substring made from the last selected line to the cursor is technically the current column.
        const currentRow = textBeforeCursor
            .split('\n')
            .pop() || '';
        return currentRow.length + 1;
    }

    getCharCount(): number {
        return this.text.value.length;
    }
    
    updateStatDisplay(row: number, col: number, char: number, totalLn: number): void {
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

    getCaretPosition(): number {
        return this.caretPosition;
    }

    setCaretPosition(position: number): void {
        this.caretPosition = position;
    }

    setCursorAndCaret(gapBuffer: GapBuffer, cursorPos: number, caretPos: number){
        gapBuffer.setCursorPos(cursorPos);
        gapBuffer.moveCursor(cursorPos);
        this.setCaretPosition(caretPos);
    }

    updateEditorText(gapBuffer: GapBuffer, output: HTMLDivElement): void {
        this.text.value = gapBuffer.toString();
        this.text.setSelectionRange(this.caretPosition, this.caretPosition);
        this.highlight(this.text, output);
    }
}