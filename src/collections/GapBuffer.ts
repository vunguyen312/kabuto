export default class GapBuffer {
    private buffer: Array<string>;
    private gapSize: number;
    private gapLeft: number;
    private gapRight: number;
    private size: number;
    private cursorPos: number;

    constructor(text: string){
        this.gapSize = 20;
        this.size = text.length + this.gapSize;
        this.buffer = this.initialize(text);
        this.gapLeft = text.length;
        this.gapRight = this.size - 1;
        this.cursorPos = text.length;
    }

    initialize(text: string): Array<string> {
        const newBuffer: Array<string> = new Array(text.length);
        
        for(let i = 0; i < text.length; i++){
            newBuffer[i] = text[i];
        }

        for(let i = 0; i < this.gapSize; i++){
            newBuffer.push('_');
        }

        return newBuffer;
    }

    //i need to clean this up
    grow(len: number): void {
        const newGapSize = this.gapRight - this.gapLeft + 1 + len;
        const newSize = this.size + len;
        const newBuffer: Array<string> = new Array(newSize);

        for (let i = 0; i < this.gapLeft; i++) {
            newBuffer[i] = this.buffer[i];
        }

        for (let i = this.gapLeft; i < this.gapLeft + newGapSize; i++) {
            newBuffer[i] = '_';
        }

        const rightStart = this.gapRight + 1;
        const newRightStart = this.gapLeft + newGapSize;

        for (let i = 0; i < this.size - rightStart; i++) {
            newBuffer[newRightStart + i] = this.buffer[rightStart + i];
        }

        this.buffer = newBuffer;
        this.size = newSize;
        this.gapRight += len;
    }

    left(position: number): void {
        while(position < this.gapLeft){
            this.gapLeft--;
            this.gapRight--;
            this.buffer[this.gapRight + 1] = this.buffer[this.gapLeft];
            this.buffer[this.gapLeft] = '_';
        }
    }

    right(position: number): void {
        while(position > this.gapLeft){
            this.gapLeft++;
            this.gapRight++;
            this.buffer[this.gapLeft - 1] = this.buffer[this.gapRight];
            this.buffer[this.gapRight] = '_';
        }
    }

    moveCursor(position: number): void {
        if(position < this.gapLeft){
            return this.left(position);
        } 
        this.right(position);
    }

    insert(input: string, position: number): void {
        const len = input.length;
        if(position !== this.gapLeft){
            this.moveCursor(position);
        }
        
        let i = 0;
        while(i < len){
            if(this.gapRight === this.gapLeft){
                this.grow(this.gapSize);
            }
            this.buffer[this.gapLeft] = input[i];
            this.gapLeft++;
            i++
            position++;
        }
    }

    //TODO: Close gap size on the right when deleting. Might cause some performance issues during long editing sessions.
    delete(position: number): void {
        if(position - 1 < 0) return;
        this.moveCursor(position);
        this.gapLeft--;
        //Gotta set the cursor pos in here because users can press backspace at the start.
        this.cursorPos--;
        this.buffer[this.gapLeft] = '_';
        
        this.shortenGap(this.gapRight);
    }
    
    shortenGap(position: number): void {
        for(let i = position; i < this.buffer.length; i++){
            this.buffer[i] = this.buffer[i + 1];
        }
        this.gapRight--;
        this.buffer.length--;
        this.size--;
    }

    setCursorPos(cursorPos: number): void {
        this.cursorPos = cursorPos;
    }

    getCursorPos(): number {
        return this.cursorPos;
    }

    getSize(): number {
        return this.size;
    }

    getBuffer(): Array<string> {
        return this.buffer;
    }

    getGapLeft(): number {
        return this.gapLeft;
    }

    getGapRight(): number {
        return this.gapRight;
    }

    setBuffer(buffer: string[]): void {
        this.buffer = buffer;
    }

    setBufferLength(length: number): void {
        this.buffer.length = length;
    }

    getCurrGap(): number {
        return this.gapRight - this.gapLeft + 1;
    }

    toString(): string {
        return this.buffer
        //For testing
            //.filter((_, index) => index < this.gapLeft || index > this.gapRight)
            .join('');
    }
}