import GapBuffer from "./GapBuffer";
import { Instruction } from "../../../types/cmdObj";

export default class CommandObject {
    private data: string;
    private instruction: Instruction;
    private location: number;

    constructor(data: string, instruction: Instruction, location: number) {
        this.data = data;
        this.instruction = instruction;
        this.location = location;
    }

    undo(gapBuffer: GapBuffer): void {
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

    merge(command: CommandObject): boolean {
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