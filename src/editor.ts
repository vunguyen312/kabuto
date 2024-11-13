interface Stats {
    ln: HTMLSpanElement;
    col: HTMLSpanElement;
    char: HTMLSpanElement;
    totalLn: HTMLSpanElement;
}

export default class Editor {
    private text: HTMLTextAreaElement;
    private lineNumbers: HTMLTextAreaElement;
    private currentRowCount: number;
    private prevRowCount: number;
    private lnTracker: HTMLSpanElement;
    private colTracker: HTMLSpanElement;
    private charTracker: HTMLSpanElement;
    private totalLnTracker: HTMLSpanElement;
    public filePath: string;

    constructor(text: HTMLTextAreaElement, lineNumbers: HTMLTextAreaElement, stats: Stats) {
        this.text = text;
        this.lineNumbers = lineNumbers;

        //Stats
        this.currentRowCount = text.value.split('\n').length;
        this.lnTracker = stats.ln;
        this.colTracker = stats.col;
        this.charTracker = stats.char;
        this.totalLnTracker = stats.totalLn;
    }
    
    setLineNumbers(){
        this.prevRowCount = this.text.value.split('\n').length;
        let lineNumbers = '';
        for(let i = 1; i <= this.prevRowCount; i++){
            lineNumbers += `${i}\n`;
        }
        this.lineNumbers.value = lineNumbers;
        console.log(this.currentRowCount, "set");
    }

    addLineNumber(addedRows: number, prevRowCount: number){
        const totalRows = prevRowCount + addedRows;

        for(let i = prevRowCount + 1; i <= totalRows; i++){
            if(this.lineNumbers.value.slice(-1) !== '\n'){
                this.lineNumbers.value += '\n';
            }

            this.lineNumbers.value += `${i}`;
        }
        console.log(addedRows, "added line");
    }

    removeLineNumber(removedRows: number){
        const rows = this.lineNumbers.value.split('\n');
        const lastRow = this.lineNumbers.value.slice(-1);
        if(lastRow === '\n'){
            rows.length -= 1;
        }
        rows.length -= removedRows;
        this.lineNumbers.value = rows.join('\n');
        console.log(rows.length, "removed line");
    }

    handleLineNumber(text: HTMLTextAreaElement): void{
        this.currentRowCount = text.value.split('\n').length;
        if(this.currentRowCount > this.prevRowCount){
            this.addLineNumber(this.currentRowCount - this.prevRowCount, this.prevRowCount);
        }
        if(this.currentRowCount < this.prevRowCount){
            this.removeLineNumber(this.prevRowCount - this.currentRowCount);
        }
        this.prevRowCount = this.currentRowCount;
    }

    handleUndo(e: KeyboardEvent, text: HTMLTextAreaElement) {
        if(e.key !== 'Ctrl' && e.key !== 'z') return;
        this.prevRowCount = text.value.split('\n').length;
        this.handleLineNumber(text);
    }

    //TODO: Add custom undo with a stack or smth cuz it dont work w the tab spaces
    handleTab(e: KeyboardEvent, text: HTMLTextAreaElement, output: HTMLDivElement) {
        if(e.key !== 'Tab') return;
        const firstHalf = text.value.substring(0, text.selectionStart);
        const secondHalf = text.value.substring(text.selectionEnd);
        text.value = firstHalf + '    ' + secondHalf;
        output.textContent = text.value;

        //Handle mouse repositioning
        text.selectionEnd = firstHalf.length + 4;

        //Update line numbers and stats
        this.highlight(text, output);
        this.getStats();
    }

    tokenize(text: HTMLTextAreaElement) {
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
    highlight(text: HTMLTextAreaElement, output: HTMLDivElement) {
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
    
    updateStatDisplay(row: number, col: number, char: number, totalLn: number) {
        this.lnTracker.textContent = `Ln: ${row.toString()},`;
        this.colTracker.textContent = `Col: ${col.toString()}`;
        this.charTracker.textContent = `${char.toString()} characters,`;
        this.totalLnTracker.textContent = `${totalLn} lines`;
    }

    getStats() {
        const row = this.getCurrRow();
        const col = this.getCurrCol();
        const char = this.getCharCount();
        const totalLn = this.prevRowCount;
        this.updateStatDisplay(row, col, char, totalLn);
    }
}