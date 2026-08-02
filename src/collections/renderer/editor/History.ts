import GapBuffer from "./GapBuffer";

type Instruction = 'insert' | 'delete';

class CommandObject {
    private readonly instruction: Instruction;
    private location: number;
    private data: string;

    constructor(instruction: Instruction, location: number, data: string) {
        this.instruction = instruction;
        this.location = location;
        this.data = data;
    }

    // TODO: improve this implementation and apologize to claude for ruining his training data
    public undo(gapBuffer: GapBuffer): void {
        const dataLength = this.data.length;
        
        if (this.instruction === 'delete') {
            const insertLocation = this.location - 1;
            gapBuffer.insert(this.data, insertLocation);
            return;
        }
        
        for (let totalDeleted = 0; totalDeleted < dataLength; totalDeleted++) {
            const charLocation = this.location + dataLength - totalDeleted;
            gapBuffer.delete(charLocation);
        }
    }

    public redo(gapBuffer: GapBuffer): void {
        const dataLength = this.data.length;

        if (this.instruction === 'insert') {
            const insertLocation = this.location;
            gapBuffer.insert(this.data, insertLocation);
            return;
        }
        
        for (let totalDeleted = 0; totalDeleted < dataLength; totalDeleted++) {
            const charLocation = this.location + dataLength - totalDeleted - 1;
            gapBuffer.delete(charLocation);
        }
    }

    public merge(command: CommandObject): boolean {
        const cmdData = command.data;
        const cmdInstruction = command.instruction;
        const cmdLocation = command.location;
        const dataLength = this.data.length;
        const isContiguousDelete = cmdLocation === this.location - 1;
        const isContiguousInsert = cmdLocation === this.location + dataLength;

        if (cmdInstruction !== this.instruction) {
            return false;
        }

        if (cmdInstruction === 'delete' && isContiguousDelete) {
            this.location = cmdLocation;
            this.data = cmdData + this.data; 
            return true;
        }

        if (!isContiguousInsert) {
            return false;
        }

        this.data += cmdData;
        return true;
    }
}

class CommandObjectRingBuffer {
    private buffer: CommandObject[];
    private head: number;
    private length: number;

    constructor(bufferSize: number) {
        this.buffer = new Array(bufferSize);
        this.head = 0;
        this.length = 0;
    }

    public push(cmdObj: CommandObject): void {
        const pushIndex = (this.head + this.length) % this.buffer.length;
        this.buffer[pushIndex] = cmdObj;

        if (this.length === this.buffer.length) {
            this.head++;
            return;
        }
        this.length++;
    }

    public pop(): CommandObject {
        if (this.length <= 0) {
            throw new Error("Cannot pop buffer of length 0");
        }

        this.length--;
        const index = (this.head + this.length) % this.buffer.length;
        return this.buffer[index];
    }

    public popFront(): CommandObject {
        if (this.length <= 0) {
            throw new Error("Cannot pop buffer of length 0");
        }

        const headValue = this.buffer[this.head];
        this.length--;
        this.head++;
        return headValue;
    }

    public getLength(): number {
        return this.length;
    }

    public peek(): CommandObject {
        if (this.buffer.length <= 0) {
            throw new Error("No command objects in ring buffer to peek at");
        }

        const index = (this.head + this.length - 1) % this.buffer.length;
        return this.buffer[index];
    }
}

export default class History {
    private readonly ACTION_LIMIT = 20;
    private undoStack: CommandObjectRingBuffer;
    private redoStack: CommandObjectRingBuffer;

    constructor() {
        this.undoStack = new CommandObjectRingBuffer(this.ACTION_LIMIT);
        this.redoStack = new CommandObjectRingBuffer(this.ACTION_LIMIT);
    }

    public recordAction(instruction: Instruction, 
                        insertPos: number, data: string): void {
        const cmdObj = new CommandObject(instruction, insertPos, data);
        const undoStackLength = this.undoStack.getLength();
        if (undoStackLength <= 0) {
            this.undoStack.push(cmdObj);
            return;
        }

        const topUndoAction = this.undoStack.peek();
        const mergeSuccess = topUndoAction.merge(cmdObj);
        if (!mergeSuccess) {
            this.undoStack.push(cmdObj);
        }
    }

    public undo(gapBuffer: GapBuffer): void {
        const undoStackLength = this.undoStack.getLength();
        if (undoStackLength <= 0) {
            return;
        }

        const topUndoAction = this.undoStack.pop();
        topUndoAction.undo(gapBuffer);
        this.redoStack.push(topUndoAction);
    }
    
    public redo(gapBuffer: GapBuffer): void {
        const redoStackLength = this.redoStack.getLength();
        if (redoStackLength <= 0) {
            return;
        }

        const topRedoAction = this.redoStack.pop();
        topRedoAction.redo(gapBuffer);
        this.undoStack.push(topRedoAction);
    }
}