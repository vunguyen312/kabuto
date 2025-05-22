import GapBuffer from "./collections/GapBuffer";
import Editor from "./Editor";

export default class Controller {
    private editor: Editor;
    private gapBuffer: GapBuffer;
    private charPairs: Map<string, string>;
    private tabSpaces: number;

    constructor(editor: Editor, gapBuffer: GapBuffer) {
        this.editor = editor;
        this.gapBuffer = gapBuffer;
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
                this.handleDownArrow(cursorPos, this.gapBuffer);
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
        for(let i = 0; i < this.tabSpaces; i++){
            gapBuffer.insert(' ', cursorPos + i);
        }
        gapBuffer.setCursorPos(cursorPos + this.tabSpaces);
        this.editor.setCaretPosition(caretPos + this.tabSpaces);
    }

    handleEnter(cursorPos: number, gapBuffer: GapBuffer): void {
        gapBuffer.insert('\n', cursorPos);
        gapBuffer.setCursorPos(cursorPos + 1);
        this.editor.setCaretPosition(this.editor.getCaretPosition() + 1);
        this.editor.addSingleLineNumber();
    }

    handleBackspace(cursorPos: number, gapBuffer: GapBuffer, caretPos: number): void {
        //If the next backspace deletes a line then remove a line number
        const buffer = gapBuffer.getBuffer();
        if(buffer[cursorPos - 1] === '\n'){
            this.editor.removeSingleLineNumber();
        }

        gapBuffer.delete(cursorPos);
        if(caretPos - 1 < 0) return;
        this.editor.setCaretPosition(caretPos - 1);
    }

    handleUpArrow(cursorPos: number, gapBuffer: GapBuffer): void {
        let breaksFound = 0;
        let lineIndex = 0;
        let rightMostPos = 0; //Tracks the right-most position the cursor can move if the previous line is too short
        let currPos = cursorPos;
        const buffer = gapBuffer.getBuffer();
        //Counts the left side of the cursor. Adding the lineIndex to the index of the next linebreak
        //will result in the location of where the cursor should appear.
        while(breaksFound < 2){
            breaksFound < 1 
            ? lineIndex++
            : rightMostPos++;
            
            currPos--;

            //Prevents attempts to go up on the first line
            if(currPos <= 0 && breaksFound === 0) return;

            if(currPos <= 0){
                currPos--;
                break;
            }
            if(buffer[currPos] !== '\n') continue;
            breaksFound++;
        }

        let newPos = rightMostPos < lineIndex 
        ? currPos + rightMostPos 
        : currPos + lineIndex;
        
        this.editor.setCursorAndCaret(gapBuffer, newPos, newPos);
    }

    //You couldn't pay AI to optimize this LOL
    handleDownArrow(cursorPos: number, gapBuffer: GapBuffer): void {
        let lineIndex = 0;
        let rightMostPos = 0;
        let breaksFound = 0;
        let currPos = cursorPos;
        let rightIndex = gapBuffer.getGapRight();
        let leftIndex = gapBuffer.getGapLeft();
        const buffer = gapBuffer.getBuffer();

        while(buffer[currPos] !== '\n'){
            lineIndex++;
            currPos--;

            if(currPos >= 0) continue;
            break;
        }

        while(breaksFound < 2){
            if(breaksFound >= 1){
                rightMostPos++;
                if(rightMostPos + rightIndex >= buffer.length - 1) breaksFound++;
                //If we count the index of the next break the jump will go further by one
                if(buffer[rightMostPos + rightIndex + 1] === '\n') breaksFound++;
                continue;
            }
            rightIndex++;
            leftIndex++;
            if(rightIndex > buffer.length) return;
            if(buffer[rightIndex] === '\n') breaksFound++;
        }

        let newPos = rightMostPos < lineIndex
        ? leftIndex + rightMostPos
        : leftIndex + lineIndex - 1;

        this.editor.setCursorAndCaret(gapBuffer, newPos, newPos);
    }

    //TODO: Down Arrow & Maybe make controller class to shorten this script size

    handleRightArrow(cursorPos: number, gapBuffer: GapBuffer, caretPos: number): void {
        const bufferLength = gapBuffer.getBuffer().length;
        const currGapSize = gapBuffer.getCurrGap();
        const newPos = cursorPos + 1;
        if(newPos > bufferLength - currGapSize) return;
        this.editor.setCursorAndCaret(gapBuffer, newPos, caretPos + 1);
    }

    handleLeftArrow(cursorPos: number, gapBuffer: GapBuffer, caretPos: number): void {
        const newPos = cursorPos - 1;
        if(newPos < 0) return;
        gapBuffer.setCursorPos(newPos);
        gapBuffer.moveCursor(newPos);

        if(caretPos - 1 < 0) return;
        this.editor.setCaretPosition(caretPos - 1);
    }

    handleInput(cursorPos: number, gapBuffer: GapBuffer, e: KeyboardEvent, caretPos: number): void {
        gapBuffer.insert(e.key, cursorPos);

        //Insert the closing character if there is one
        this.handleClosingChars(cursorPos, gapBuffer, e);

        gapBuffer.setCursorPos(cursorPos + 1);
        this.editor.setCaretPosition(caretPos + 1);
    }

    handleClosingChars(cursorPos: number, gapBuffer: GapBuffer, e: KeyboardEvent): void {
        if(!this.charPairs.has(e.key)) return;
        const closingChar = this.charPairs.get(e.key);
        gapBuffer.insert(closingChar, cursorPos + 1);
    }
}