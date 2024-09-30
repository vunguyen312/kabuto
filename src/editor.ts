export default class Editor {
    private text: HTMLTextAreaElement;
    private lineNumbers: HTMLTextAreaElement;
    public totalRows: number;

    constructor(text: HTMLTextAreaElement, lineNumbers: HTMLTextAreaElement) {
        this.text = text;
        this.lineNumbers = lineNumbers;
    }
    
    setLineNumbers(){
        this.countRows();
        for(let i = 1; i <= this.totalRows; i++){
            this.lineNumbers.value += `${i}\n`;
        }
    }

    addLineNumber(){
        this.totalRows++;
        if(this.lineNumbers.value.slice(-1) !== '\n'){
            this.lineNumbers.value += '\n';
        }
        this.lineNumbers.value += `${this.totalRows}`;
    }

    removeLineNumber(removedRows: number){
        this.totalRows -= removedRows;
        const rows = this.lineNumbers.value.split('\n');
        rows.length = this.totalRows;
        this.lineNumbers.value = rows.join('\n');
    }

    countRows(){
        this.totalRows = this.text.value.split('\n').length;
        return this.totalRows;
    }
}