import GapBuffer from "./GapBuffer";
import Editor from "./Editor";
import HistoryList from "./HistoryList";

export default class Controller {
    private readonly charPairs = new Map([
            ['{', '}'],
            ['[', ']'],
            ["'", "'"],
            ['"', '"'],
            ['(', ')'],
            ['`', '`']
        ]);
    private editor: Editor;
    private gapBuffer: GapBuffer;
    //Tracks the cursor's 'true' index in a single line
    //Basically, it controls the behaviour text editors have when using up and 
    // down arrow keys to navigate
    private trueIndex = 0;
    private undoList: HistoryList;

    constructor(editor: Editor, gapBuffer: GapBuffer) {
        this.undoList = new HistoryList();
        this.editor = editor;
        this.gapBuffer = gapBuffer;
    }

    init(text: HTMLTextAreaElement): void {
        this.setEventListeners(text);
    }

    setEventListeners(text: HTMLTextAreaElement): void {
        text.addEventListener('keydown', (e: KeyboardEvent) => 
            this.listenForKeystrokes(e, text));
        text.addEventListener('click', (e: MouseEvent) => 
            this.handleClick(e, this.gapBuffer, text.selectionStart));
    }

    listenForKeystrokes(e: KeyboardEvent, text: HTMLTextAreaElement): void {
        e.preventDefault();
        this.editor.handleUndo(e, text);
        //Cursor pos refers to GapBuffer's gap
        const cursorPos = this.gapBuffer.getGapLeft();
        const isShortcut = e.ctrlKey || e.metaKey;

        switch(e.key) {
            case "Enter":
                this.handleEnter(cursorPos, this.gapBuffer);
                break;
            case "Backspace":
                this.handleBackspace(cursorPos, this.gapBuffer);
                break;
            case "Tab":
                this.handleTab(cursorPos, this.gapBuffer);
                break;
            case "ArrowRight":
                this.handleRightArrow(cursorPos, this.gapBuffer);
                break;
            case "ArrowUp":
                this.handleUpArrow(cursorPos, this.gapBuffer);
                break;
            case "ArrowLeft":
                this.handleLeftArrow(cursorPos, this.gapBuffer);
                break;
            case "ArrowDown":
                this.handleDownArrow(this.gapBuffer);
                break;
            case "z":
                if (isShortcut) {
                    this.handleUndo(this.gapBuffer);
                } else {
                    this.handleInput(cursorPos, this.gapBuffer, e);
                }
                break;
            default:
                if(e.key.length !== 1) return;
                this.handleInput(cursorPos, this.gapBuffer, e);
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

        return cursorPos - index;
    }

    //TODO: Add custom undo with a stack or smth cuz it dont work w the 
    // tab spaces
    handleTab(cursorPos: number, gapBuffer: GapBuffer): void {
        const nextCursorPos = cursorPos + 1;
        this.addText('\t', cursorPos, nextCursorPos, gapBuffer, null);
    }

    handleEnter(cursorPos: number, gapBuffer: GapBuffer): void {
        const nextCursorPos = cursorPos + 1;
        const beginningIndex = 0;
        this.trueIndex = beginningIndex;

        this.addText('\n', cursorPos, nextCursorPos, gapBuffer, null);
        this.editor.addSingleLineNumber();
    }

    handleBackspace(cursorPos: number, gapBuffer: GapBuffer): void {
        const prevIndex = cursorPos - 1;
        const beginningIndex = 0;
        const buffer = gapBuffer.getBuffer();
        
        if (cursorPos <= beginningIndex) {
            return;
        }
        if (buffer[prevIndex] === '\n') {
            this.editor.removeSingleLineNumber();
            
            this.undoList.createNode('\n', 'delete', cursorPos);
            gapBuffer.delete(cursorPos);
            this.trueIndex = this.getTrueIndex(prevIndex, gapBuffer);
            return;
        }

        this.trueIndex--;
        this.undoList.createNode(buffer[prevIndex], 'delete', cursorPos);
        gapBuffer.delete(cursorPos);
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

            if (currPos < beginningIndex && breaksFound === beginningIndex) {
                return;
            }
            if (currPos < beginningIndex) {
                break;
            }
            
            if (buffer[currPos] === '\n') breaksFound++;
        }

        const prevRightMostPos = currPos + rightMostPos;
        const trueIndexPos = currPos + this.trueIndex + 1;
        const newPos = Math.min(prevRightMostPos, trueIndexPos);
        this.editor.setCursorAndCaret(gapBuffer, newPos);
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

        this.editor.setCursorAndCaret(gapBuffer, newPos);
    }

    handleRightArrow(cursorPos: number, gapBuffer: GapBuffer): void {
        const buffer = gapBuffer.getBuffer();
        const bufferSize = gapBuffer.getSize();
        const currGapSize = gapBuffer.getCurrGap();
        const nextCursorPos = cursorPos + 1;

        if (nextCursorPos > bufferSize - currGapSize) return;

        this.editor.setCursorAndCaret(gapBuffer, nextCursorPos);
        this.findTrueIndex(nextCursorPos, buffer);
    }

    handleLeftArrow(cursorPos: number, gapBuffer: GapBuffer): void {
        const prevCursorPos = cursorPos - 1;
        const beginningIndex = 0;
        const buffer = gapBuffer.getBuffer();
        if (prevCursorPos < beginningIndex) return;

        gapBuffer.moveCursor(prevCursorPos);
        this.findTrueIndex(prevCursorPos, buffer);
    }

    findTrueIndex(cursorPos: number, buffer: string[]): void {
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
        const cursorPos = gapBuffer.getGapLeft(); 

        this.relocateCursorOnClick(cursorPos, gapBuffer, newCursorPos);
        this.findTrueIndex(newCursorPos, gapBuffer.getBuffer());

        this.editor.updateEditorText();
        this.editor.getStats();
    }

    relocateCursorOnClick(cursorPos: number, gapBuffer: GapBuffer, 
                          newCursorPos: number): void {
        if (newCursorPos === cursorPos) return;
        this.editor.setCursorAndCaret(gapBuffer, newCursorPos);
    }

    handleInput(cursorPos: number, gapBuffer: GapBuffer, 
                e: KeyboardEvent): void {
        const data = e.key;
        const nextCursorPos = cursorPos + 1;
        this.trueIndex++;

        this.addText(data, cursorPos, nextCursorPos, gapBuffer, e);
    }

    addText(data: string, insertPos: number, nextPos: number, 
            gapBuffer: GapBuffer, e: KeyboardEvent | null): void {
        this.undoList.createNode(data, 'insert', insertPos);
        gapBuffer.insert(data, insertPos);
        if (e) {
            this.handleClosingChars(insertPos, gapBuffer, e);
        }
    }

    handleClosingChars(cursorPos: number, gapBuffer: GapBuffer, 
                       e: KeyboardEvent): void {
        if(!this.charPairs.has(e.key)) return;
        const nextCursorPos = cursorPos + 1;
        const closingChar = this.charPairs.get(e.key)!;
        gapBuffer.insert(closingChar, nextCursorPos);
    }

    handleUndo(gapBuffer: GapBuffer): void {
        const head = this.undoList.getHead();
        
        if (!head) {
            return;
        }

        const command = head.getCommand();
        command.undo(gapBuffer);
        this.undoList.removeHead();
    }
}

//TODO: Sync to scroll down as the user types downwards
//TODO: Add select delete and copy paste
