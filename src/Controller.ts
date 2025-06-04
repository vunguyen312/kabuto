import GapBuffer from "./collections/GapBuffer";
import Editor from "./Editor";

export default class Controller {
    private editor: Editor;
    private gapBuffer: GapBuffer;
    private tabSpaces: number;
    //Tracks the cursor's 'true' index in a single line
    //Basically, it controls the behaviour text editors have when using up and down arrow keys to navigate
    private trueIndex: number;
    private readonly charPairs: Map<string, string>;

    constructor(editor: Editor, gapBuffer: GapBuffer) {
        this.editor = editor;
        this.gapBuffer = gapBuffer;
        this.trueIndex = 0;
        this.charPairs = new Map([
            ['{', '}'],
            ['[', ']'],
            ["'", "'"],
            ['"', '"'],
            ['(', ')'],
            ['`', '`']
        ]);

        //Settings
        this.tabSpaces = 4;
    }

    listenForKeystrokes(e: KeyboardEvent, text: HTMLTextAreaElement, output: HTMLDivElement): void {
        //this.editor.handleLineNumber(this.text);
        //this.editor.getStats();
        e.preventDefault();
        this.editor.handleUndo(e, text);
        //Cursor pos refers to GapBuffer's gap
        const cursorPos = this.gapBuffer.getCursorPos();
        //Caret pos refers to visual cursor on the editor
        const caretPos = this.editor.getCaretPosition();

        //Might move all this key stuff to the editor class later
        switch(e.key){
            case "Enter":
                this.handleEnter(cursorPos, this.gapBuffer);
                break;
            case "Backspace":
                this.handleBackspace(cursorPos, this.gapBuffer, caretPos);
                break;
            case "Tab":
                this.handleTab(cursorPos, this.gapBuffer, caretPos);
                break;
            case "ArrowRight":
                this.handleRightArrow(cursorPos, this.gapBuffer, caretPos);
                break;
            case "ArrowUp":
                this.handleUpArrow(cursorPos, this.gapBuffer);
                break;
            case "ArrowLeft":
                this.handleLeftArrow(cursorPos, this.gapBuffer, caretPos);
                break;
            case "ArrowDown":
                this.handleDownArrow(this.gapBuffer);
                break;
            default:
                if(e.key.length !== 1) return;
                this.handleInput(cursorPos, this.gapBuffer, e, caretPos);
                break;
        }

        this.editor.updateEditorText(this.gapBuffer, output);
        this.editor.getStats();
    }

    //TODO: Add custom undo with a stack or smth cuz it dont work w the tab spaces
    handleTab(cursorPos: number, gapBuffer: GapBuffer, caretPos: number): void {
        for(let space = 0; space < this.tabSpaces; space++){
            gapBuffer.insert(' ', cursorPos + space);
        }
        this.editor.setCursorAndCaret(gapBuffer, cursorPos + this.tabSpaces, caretPos + this.tabSpaces);
    }

    handleEnter(cursorPos: number, gapBuffer: GapBuffer): void {
        gapBuffer.insert('\n', cursorPos);
        gapBuffer.setCursorPos(cursorPos + 1);
        this.editor.setCaretPosition(this.editor.getCaretPosition() + 1);
        this.editor.addSingleLineNumber();
        this.trueIndex = 0;
    }

    handleBackspace(cursorPos: number, gapBuffer: GapBuffer, caretPos: number): void {
        //If the next backspace deletes a line then remove a line number
        const buffer = gapBuffer.getBuffer();
        if(buffer[cursorPos - 1] === '\n'){
            this.editor.removeSingleLineNumber();
        }

        gapBuffer.delete(cursorPos);
        this.trueIndex--;
        if(caretPos - 1 < 0) return;
        this.editor.setCaretPosition(caretPos - 1);
    }

    handleUpArrow(cursorPos: number, gapBuffer: GapBuffer): void {
        let breaksFound = 0;
        let rightMostPos = 0; //Tracks the right-most position the cursor can move if the previous line is too short
        let currPos = cursorPos;
        const buffer = gapBuffer.getBuffer();
        //Counts the left side of the cursor. Adding the lineIndex to the index of the next linebreak
        //will result in the location of where the cursor should appear.
        while(breaksFound < 2){
            if(breaksFound >= 1){
                rightMostPos++;
            }
            
            currPos--;

            //Prevents attempts to go up on the first line
            if(currPos <= 0 && breaksFound === 0) return;
            if(currPos < 0) break;
            
            if(buffer[currPos] !== '\n') continue;
            breaksFound++;
        }

        let newPos = rightMostPos < this.trueIndex + 1
        ? currPos + rightMostPos 
        : currPos + this.trueIndex + 1;
        
        this.editor.setCursorAndCaret(gapBuffer, newPos, newPos);
    }

    //You couldn't pay AI to optimize this LOL
    handleDownArrow(gapBuffer: GapBuffer): void {
        let rightMostPos = 0;
        let breaksFound = 0;
        let rightIndex = gapBuffer.getGapRight();
        let leftIndex = gapBuffer.getGapLeft();
        const buffer = gapBuffer.getBuffer();

        while(breaksFound < 2){
            if(breaksFound >= 1){
                rightMostPos++;
                //If we count the index of the next break the jump will go further by one
                const nextIndex = rightMostPos + rightIndex + 1;
                const nextLine = nextIndex >= buffer.length || buffer[nextIndex] === '\n';
                if(nextLine) breaksFound++;
                continue;
            }
            rightIndex++;
            leftIndex++;
            if(rightIndex > buffer.length) return;
            if(buffer[rightIndex] === '\n') breaksFound++;
        }

        console.log(rightMostPos, leftIndex, this.trueIndex);
        let newPos = rightMostPos < this.trueIndex
        ? leftIndex + rightMostPos
        : leftIndex + this.trueIndex;

        this.editor.setCursorAndCaret(gapBuffer, newPos, newPos);
    }

    handleRightArrow(cursorPos: number, gapBuffer: GapBuffer, caretPos: number): void {
        const buffer = gapBuffer.getBuffer();
        const bufferLength = buffer.length;
        const currGapSize = gapBuffer.getCurrGap();
        const newPos = cursorPos + 1;

        if(newPos > bufferLength - currGapSize) return;

        this.editor.setCursorAndCaret(gapBuffer, newPos, caretPos + 1);
        this.findTrueIndex(newPos, buffer);
    }

    handleLeftArrow(cursorPos: number, gapBuffer: GapBuffer, caretPos: number): void {
        const newPos = cursorPos - 1;
        if(newPos < 0) return;

        gapBuffer.setCursorPos(newPos);
        gapBuffer.moveCursor(newPos);
        this.findTrueIndex(newPos, gapBuffer.getBuffer());

        if(caretPos - 1 < 0) return;
        this.editor.setCaretPosition(caretPos - 1);
    }

    findTrueIndex(cursorPos: number, buffer: Array<String>): void {
        let currPos = cursorPos;
        let trueIndex = 0;
        while(buffer[currPos - 1] !== '\n'){
            if(currPos <= 0) break;
            trueIndex++;
            currPos--;
        }

        this.trueIndex = trueIndex;
    }

    handleClick(e: MouseEvent, gapBuffer: GapBuffer, newCursorPos: number, output: HTMLDivElement): void {
        e.preventDefault();
        const cursorPos = gapBuffer.getCursorPos(); 

        this.relocateCursorOnClick(cursorPos, gapBuffer, newCursorPos);
        this.findTrueIndex(newCursorPos, gapBuffer.getBuffer());
        console.log(newCursorPos);

        this.editor.updateEditorText(this.gapBuffer, output);
        this.editor.getStats();
    }

    relocateCursorOnClick(cursorPos: number, gapBuffer: GapBuffer, newCursorPos: number): void {
        if(newCursorPos === cursorPos) return;
        this.editor.setCursorAndCaret(gapBuffer, newCursorPos, newCursorPos);
    }

    handleInput(cursorPos: number, gapBuffer: GapBuffer, e: KeyboardEvent, caretPos: number): void {
        gapBuffer.insert(e.key, cursorPos);

        //Insert the closing character if there is one
        this.handleClosingChars(cursorPos, gapBuffer, e);

        gapBuffer.setCursorPos(cursorPos + 1);
        this.editor.setCaretPosition(caretPos + 1);
        this.trueIndex++;
    }

    handleClosingChars(cursorPos: number, gapBuffer: GapBuffer, e: KeyboardEvent): void {
        if(!this.charPairs.has(e.key)) return;
        const closingChar = this.charPairs.get(e.key);
        gapBuffer.insert(closingChar, cursorPos + 1);
    }
}