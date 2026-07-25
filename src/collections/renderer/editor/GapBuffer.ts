export default class GapBuffer {
    private static readonly GROWTH_RATE = 2;
    private gapIncrease: number;
    private buffer: Array<string>;
    private gapLeft: number;
    private gapRight: number;

    constructor(text: string){
        this.gapIncrease = 5;
        this.buffer = new Array();
        this.gapLeft = text.length;
        this.gapRight = text.length + this.gapIncrease - 1;

        this.loadText(text);
    }

    public loadText(text: string): void {
        this.gapLeft = text.length;
        const newSize = text.length + this.gapIncrease;
        const newBuffer: Array<string> = new Array(newSize);

        for (let i = 0; i < this.gapLeft; i++) {
            newBuffer[i] = text[i];
        }

        const gapLength = this.gapLeft + this.gapIncrease;
        for (let i = this.gapLeft; i < gapLength; i++) {
            newBuffer[i] = '_';
        }

        this.gapRight = gapLength - 1;
        this.buffer = newBuffer;
    }

    private grow(): void {
        this.gapIncrease *= GapBuffer.GROWTH_RATE;
        const currGapLength = this.getCurrGap();
        const newSize = this.buffer.length - currGapLength + this.gapIncrease;
        const newBuffer: Array<string> = new Array(newSize);
        
        for (let i = 0; i < this.gapLeft; i++) {
            newBuffer[i] = this.buffer[i];
        }
        
        const endGapLength = this.gapLeft + this.gapIncrease;
        for (let i = this.gapLeft; i < endGapLength; i++) {
            newBuffer[i] = '_';
        }
        
        const rightStart = this.gapRight + 1;
        const rightLength = this.buffer.length - rightStart;
        const newRightStart = newBuffer.length - rightLength;
        for (let i = 0; i < rightLength; i++) {
            newBuffer[newRightStart + i] = this.buffer[rightStart + i];
        }

        this.gapRight = endGapLength - 1;
        this.buffer = newBuffer;
    }

    left(position: number): void {
        while (position < this.gapLeft) {
            this.gapLeft--;
            this.gapRight--;
            this.buffer[this.gapRight + 1] = this.buffer[this.gapLeft];
            this.buffer[this.gapLeft] = '_';
        }
    }

    right(position: number): void {
        while (position > this.gapLeft) {
            this.gapLeft++;
            this.gapRight++;
            this.buffer[this.gapLeft - 1] = this.buffer[this.gapRight];
            this.buffer[this.gapRight] = '_';
        }
    }

    moveCursor(position: number): void {
        const currGapLength = this.getCurrGap();
        if (currGapLength === 0) {
            this.gapLeft = position;
            this.gapRight = position - 1;
            return;
        }

        if (position < this.gapLeft) {
            this.left(position);
            return;
        } 
        this.right(position);
    }

    insert(input: string, position: number): void {
        const len = input.length;
        if (position !== this.gapLeft) {
            this.moveCursor(position);
        }

        for (let index = 0; index < len; index++) {
            if (this.gapRight === this.gapLeft - 1) {
                this.grow();
            }
            this.buffer[this.gapLeft] = input[index];
            this.gapLeft++;
            position++;
        }
    }

    public delete(position: number): void {
        if (position - 1 < 0) {
            return;
        }

        this.moveCursor(position);
        this.gapLeft--;
        this.buffer[this.gapLeft] = '_';
    }

    getSize(): number {
        return this.buffer.length;
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
            .filter((_, index) => 
                index < this.gapLeft || index > this.gapRight)
            .join('');
    }
}