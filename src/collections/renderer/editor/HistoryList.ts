import CommandObject from "./CommandObject";
import { Instruction } from "../../../types/cmdObj";

class Node {
    private prevNode: Node;
    private nextNode: Node;
    private readonly command: CommandObject;

    constructor(prevNode: Node, nextNode: Node, command: CommandObject) {
        this.prevNode = prevNode;
        this.nextNode = nextNode;
        this.command = command;
    }

    setPrev(node: Node): void {
        this.prevNode = node;
    }

    setNext(node: Node): void {
        this.nextNode = node;
    }

    getPrev(): Node {
        return this.prevNode;
    }

    getNext(): Node {
        return this.nextNode;
    }

    getCommand(): CommandObject {
        return this.command;
    }
}

export default class HistoryList {
    private head: Node = null;
    private readonly updateEditorText: Function;

    constructor(updateEditorText: Function) {
        this.updateEditorText = updateEditorText;
    }

    createNode(data: string, instruction: Instruction, 
               location: number): void {
        const cmd = new CommandObject(data, instruction, location, 
                                      this.updateEditorText);
        const node = new Node(null, null, cmd);

        if (!this.head) {
            this.head = node;
            return;
        }

        const headCommand = this.head.getCommand();

        if (!headCommand.merge(cmd)) {
            this.append(this.head, node);
            this.head = node;
        }
    }

    append(target: Node, input: Node): void {
        target.setNext(input);
        input.setPrev(target);
    }
}