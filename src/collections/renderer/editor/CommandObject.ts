import GapBuffer from "./GapBuffer";
import { Instruction } from "../../../types/cmdObj";

export default class CommandObject {
    private data: string;
    private instruction: Instruction;
    private location: number;
    private updateEditorText: Function;

    constructor(data: string, instruction: Instruction, location: number,
                updateEditorText: Function) {
        this.data = data;
        this.instruction = instruction;
        this.location = location;
        this.updateEditorText = updateEditorText;
    }

    execute(gapBuffer: GapBuffer): void {
        const dataLength = this.data.length;
        
        if (this.instruction === 'insert') {
            return gapBuffer.insert(this.data, this.location);
        }
        
        for (let totalDeleted = 0; totalDeleted < dataLength; totalDeleted++) {
            gapBuffer.delete(this.location - totalDeleted);
        }
    }

    merge(command: CommandObject): boolean {
        const cmdData = command.data;
        const cmdInstruction = command.instruction;

        if (cmdInstruction === this.instruction) {
            this.data += cmdData;
            return true;
        }

        return false;
    }
}