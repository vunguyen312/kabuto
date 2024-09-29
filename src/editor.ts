export default class Editor {
    public text: HTMLTextAreaElement;
    private lineNumbers: HTMLTextAreaElement;

    constructor(text: HTMLTextAreaElement, lineNumbers: HTMLTextAreaElement) {
        this.text = text;
        this.lineNumbers = lineNumbers;
    }
    
    addLineNumbers(){
        const rows = this.countRows();
        for(let i = 1; i <= rows; i++){
            this.lineNumbers.value += `${i}\n`;
        }
    }

    countRows(){
        const rows = this.text.value.split('\n');
        return rows.length;
    }
}