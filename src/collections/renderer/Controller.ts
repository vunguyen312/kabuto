import GapBuffer from "./GapBuffer";
import Editor from "./Editor";

export default class Controller {
    private readonly charPairs: Map<string, string>;
    private editor: Editor;
    private gapBuffer: GapBuffer;
    private tabSpaces: number;
    //Tracks the cursor's 'true' index in a single line
    //Basically, it controls the behaviour text editors have when using up and 
    // down arrow keys to navigate
    private trueIndex: number;

    constructor(editor: Editor, gapBuffer: GapBuffer, 
                text: HTMLTextAreaElement, output: HTMLDivElement) {
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

        //Initialize
        this.setEventListeners(text, output);
    }

    setEventListeners(text: HTMLTextAreaElement, 
                      output: HTMLDivElement): void {
        text.addEventListener('keydown', (e: KeyboardEvent) => 
            this.listenForKeystrokes(e, text, output));
        text.addEventListener('click', (e: MouseEvent) => 
            this.handleClick(e, this.gapBuffer, text.selectionStart));
    }

    listenForKeystrokes(e: KeyboardEvent, text: HTMLTextAreaElement, 
                        output: HTMLDivElement): void {
        e.preventDefault();
        this.editor.handleUndo(e, text);
        //Cursor pos refers to GapBuffer's gap
        const cursorPos = this.gapBuffer.getCursorPos();
        //Caret pos refers to visual cursor on the editor
        const caretPos = this.editor.getCaretPosition();

        switch(e.key) {
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

        this.editor.updateEditorText();
        this.editor.getStats();
    }

    getTrueIndex(cursorPos: number, gapBuffer: GapBuffer): number {
        const gbuffer = gapBuffer.getBuffer();
        const beginningIndex = 0;
        let index = cursorPos;
        while (gbuffer[index] !== '\n' || index > beginningIndex) {
            const prevIndex = index - 1;
            const trueIndex = cursorPos - index;

            if (gbuffer[prevIndex] === '\n' || index <= beginningIndex)
                return trueIndex;

            index--;
        }
    }

    //TODO: Add custom undo with a stack or smth cuz it dont work w the 
    // tab spaces
    handleTab(cursorPos: number, gapBuffer: GapBuffer, 
              caretPos: number): void {
        const nextCursorPos = cursorPos + 1;
        const nextCaretPos = caretPos + 1;
        
        gapBuffer.insert('\t', cursorPos);
        this.editor.setCursorAndCaret(gapBuffer, nextCursorPos, nextCaretPos);
    }

    handleEnter(cursorPos: number, gapBuffer: GapBuffer): void {
        const nextCursorPos = cursorPos + 1;
        const nextCaretPos = this.editor.getCaretPosition() + 1
        const beginningIndex = 0;
        this.trueIndex = beginningIndex;

        gapBuffer.insert('\n', cursorPos);
        gapBuffer.setCursorPos(nextCursorPos);
        this.editor.setCaretPosition(nextCaretPos);
        this.editor.addSingleLineNumber();
    }

    handleBackspace(cursorPos: number, gapBuffer: GapBuffer, 
                    caretPos: number): void {
        const prevIndex = cursorPos - 1;
        const prevCaretIndex = caretPos - 1;
        const beginningIndex = 0;
        const buffer = gapBuffer.getBuffer();
        //If the next backspace deletes a line then remove a line number
        if (cursorPos <= beginningIndex) return;
        if (buffer[prevIndex] === '\n') {
            this.editor.removeSingleLineNumber();
            
            gapBuffer.delete(cursorPos);
            this.trueIndex = this.getTrueIndex(prevIndex, gapBuffer);
            this.editor.setCaretPosition(prevCaretIndex);
            return;
        }

        this.trueIndex--;
        gapBuffer.delete(cursorPos);
        this.editor.setCaretPosition(prevCaretIndex);
    }

    handleUpArrow(cursorPos: number, gapBuffer: GapBuffer): void {
        const buffer = gapBuffer.getBuffer();
        const requiredBreaks = 2;
        const breaksSkipped = 1;
        const beginningIndex = 0;
        let breaksFound = 0;
        //Tracks the right-most position the cursor can 
        // move if the previous line is too short
        let rightMostPos = 0;
        let currPos = cursorPos;
        console.log(currPos);
        //Counts the left side of the cursor. Adding the lineIndex to the index
        //  of the next linebreak will result in the location of where the 
        //  cursor should appear.
        while (breaksFound < requiredBreaks) {
            if (breaksFound >= breaksSkipped)
                rightMostPos++;
            
            currPos--;

            //Prevents attempts to go up on the first line
            if (currPos < beginningIndex && breaksFound === beginningIndex) 
                return;
            if (currPos < beginningIndex) break;
            
            if (buffer[currPos] === '\n') breaksFound++;
        }

        const prevRightMostPos = currPos + rightMostPos;
        const trueIndexPos = currPos + this.trueIndex + 1;
        const newPos = Math.min(prevRightMostPos, trueIndexPos);
        //yo lowkey if cursorPos and caretPos r the same why do i have them as
        // diff variables LOL
        this.editor.setCursorAndCaret(gapBuffer, newPos, newPos);
    }

    //You couldn't pay AI to optimize this LOL
    handleDownArrow(gapBuffer: GapBuffer): void {
        const buffer = gapBuffer.getBuffer();
        const requiredBreaks = 2;
        const breaksSkipped = 1;
        let rightMostPos = 0;
        let breaksFound = 0;
        let rightIndex = gapBuffer.getGapRight();
        let leftIndex = gapBuffer.getGapLeft();

        while (breaksFound < requiredBreaks) {
            if (breaksFound >= breaksSkipped) {
                //If we count the index of the next break the jump will go 
                // further by one
                const nextIndex = rightMostPos + rightIndex + 1;
                const nextLine = nextIndex >= buffer.length 
                                 || buffer[nextIndex] === '\n';

                if (nextLine)
                    break;
                rightMostPos++;
                continue;
            }
            rightIndex++;
            leftIndex++;

            if (rightIndex > buffer.length) return;
            if (buffer[rightIndex] === '\n') breaksFound++;
        }

        const nextRightMostPos = leftIndex + rightMostPos;
        const trueIndexPos = leftIndex + this.trueIndex;
        const newPos = Math.min(nextRightMostPos, trueIndexPos);

        this.editor.setCursorAndCaret(gapBuffer, newPos, newPos);
    }

    handleRightArrow(cursorPos: number, gapBuffer: GapBuffer, 
                     caretPos: number): void {
        const buffer = gapBuffer.getBuffer();
        const bufferSize = gapBuffer.getSize();
        const currGapSize = gapBuffer.getCurrGap();
        const nextCursorPos = cursorPos + 1;
        const nextCaretPos = caretPos + 1;

        if (nextCursorPos > bufferSize - currGapSize) return;

        this.editor.setCursorAndCaret(gapBuffer, nextCursorPos, nextCaretPos);
        this.findTrueIndex(nextCursorPos, buffer);
    }

    handleLeftArrow(cursorPos: number, gapBuffer: GapBuffer, 
                    caretPos: number): void {
        const prevCursorPos = cursorPos - 1;
        const prevCaretPos = caretPos - 1;
        const beginningIndex = 0;
        if (prevCursorPos < beginningIndex) return;

        gapBuffer.setCursorPos(prevCursorPos);
        gapBuffer.moveCursor(prevCursorPos);
        this.findTrueIndex(prevCursorPos, gapBuffer.getBuffer());

        if (prevCaretPos < beginningIndex) return;
        this.editor.setCaretPosition(prevCaretPos);
    }

    findTrueIndex(cursorPos: number, buffer: Array<String>): void {
        let currPos = cursorPos;
        let trueIndex = 0;
        while (buffer[currPos - 1] !== '\n') {
            if (currPos <= 0) break;
            trueIndex++;
            currPos--;
        }

        this.trueIndex = trueIndex;
    }

    handleClick(e: MouseEvent, gapBuffer: GapBuffer, newCursorPos: number): void {
        e.preventDefault();
        const cursorPos = gapBuffer.getCursorPos(); 

        this.relocateCursorOnClick(cursorPos, gapBuffer, newCursorPos);
        this.findTrueIndex(newCursorPos, gapBuffer.getBuffer());

        this.editor.updateEditorText();
        this.editor.getStats();
    }

    relocateCursorOnClick(cursorPos: number, gapBuffer: GapBuffer, 
                          newCursorPos: number): void {
        if (newCursorPos === cursorPos) return;
        this.editor.setCursorAndCaret(gapBuffer, newCursorPos, newCursorPos);
    }

    handleInput(cursorPos: number, gapBuffer: GapBuffer, e: KeyboardEvent, 
                caretPos: number): void {
        const nextCursorPos = cursorPos + 1;
        const nextCaretPos = caretPos + 1;
        this.trueIndex++;

        gapBuffer.insert(e.key, cursorPos);
        //Insert the closing character if there is one
        this.handleClosingChars(cursorPos, gapBuffer, e);
        gapBuffer.setCursorPos(nextCursorPos);
        this.editor.setCaretPosition(nextCaretPos);
    }

    handleClosingChars(cursorPos: number, gapBuffer: GapBuffer, 
                       e: KeyboardEvent): void {
        if(!this.charPairs.has(e.key)) return;
        const nextCursorPos = cursorPos + 1;
        const closingChar = this.charPairs.get(e.key);
        gapBuffer.insert(closingChar, nextCursorPos);
    }
}

//TODO: Sync to scroll down as the user types downwards
//TODO: Add select delete and copy paste