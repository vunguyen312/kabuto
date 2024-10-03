export default class Editor {
    private text: HTMLTextAreaElement;
    private lineNumbers: HTMLTextAreaElement;
    private currentRowCount: number;
    private prevRowCount: number;

    constructor(text: HTMLTextAreaElement, lineNumbers: HTMLTextAreaElement) {
        this.text = text;
        this.lineNumbers = lineNumbers;
        this.currentRowCount = text.value.split('\n').length;
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

    handleLineNumber(text: HTMLTextAreaElement){
        this.currentRowCount = text.value.split('\n').length;
        if(this.currentRowCount > this.prevRowCount){
            this.addLineNumber(this.currentRowCount - this.prevRowCount, this.prevRowCount);
        }
        if(this.currentRowCount < this.prevRowCount){
            this.removeLineNumber(this.prevRowCount - this.currentRowCount);
        }
        this.prevRowCount = this.currentRowCount;
    }

    handleUndo = (e: KeyboardEvent, text: HTMLTextAreaElement) => {
        if(e.key !== 'Ctrl' && e.key !== 'z') return;
        this.prevRowCount = text.value.split('\n').length;
        this.handleLineNumber(text);
    }
}