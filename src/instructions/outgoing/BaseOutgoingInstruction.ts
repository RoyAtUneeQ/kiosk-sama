import type { OutgoingInstruction } from "@/types";

export class BaseOutgoingInstruction implements OutgoingInstruction {
    payload: any;

    constructor(payload: any) {
        this.payload = payload;
    }

    generate(): Promise<string> | string {
        return '';
    }
}   