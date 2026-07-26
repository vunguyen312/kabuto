import CommandObject from "./CommandObject";
import type { Instruction } from "./types";

class Node {
    private prevNode: Node | null;
    private nextNode: Node | null;
    private readonly command: CommandObject;

    constructor(prevNode: Node | null, nextNode: Node | null,
                command: CommandObject) {
        this.prevNode = prevNode;
        this.nextNode = nextNode;
        this.command = command;
    }

    setPrev(node: Node | null): void {
        this.prevNode = node;
    }

    setNext(node: Node | null): void {
        this.nextNode = node;
    }

    getPrev(): Node | null {
        return this.prevNode;
    }

    getNext(): Node | null {
        return this.nextNode;
    }

    getCommand(): CommandObject {
        return this.command;
    }
}

export default class HistoryList {
    private readonly actionLimit: number;
    private actionCount: number;
    private head: Node | null;
    private tail: Node | null;

    constructor() {
        //TODO: FINISH IMPLEMENTING ACTION LIMITS
        this.actionLimit = 2;
        this.actionCount = 0;
        this.head = null;
        this.tail = null;
    }

    createNode(data: string, instruction: Instruction, 
               location: number): void {
        const cmd = new CommandObject(data, instruction, location);
        const node = new Node(this.head, null, cmd);

        if (!this.head) {
            this.head = node;
            this.tail = node;
            this.actionCount++;
            return;
        }

        const headCommand = this.head.getCommand();
        const isMergeable = headCommand.merge(cmd);

        if (isMergeable) {
            return;
        }

        //if (this.actionCount >= this.actionLimit) {
        //    this.removeTail();
        //    this.actionCount--;
        //}

        this.head.setNext(node);
        this.head = node;
        this.actionCount++;
    }

    removeHead(): void {
        if (!this.head) {
            return;
        }

        const prevNode = this.head.getPrev();
        //this.printList();

        if (prevNode) {
            this.head = prevNode;
            prevNode.setNext(null);
            return;
        }

        this.head = null;
    }

    // a little inefficient but will do for now
    removeTail(): void {
        if (!this.head || !this.tail) {
            return;
        }

        const tailNext = this.tail.getNext();
        if (!tailNext) {
            this.head = null;
            this.tail = null;
            return;
        }

        tailNext.setPrev(null);
        this.tail = tailNext;
    }

    append(target: Node, input: Node): void {
        target.setNext(input);
        input.setPrev(target);
    }

    printList(): void {
        if (!this.head) {
            return;
        }

        let curr: Node | null = this.head;
        while (curr) {
            console.log(curr);
            curr = curr.getPrev();
        }
    }

    getHead(): Node | null {
        return this.head;
    }
}
