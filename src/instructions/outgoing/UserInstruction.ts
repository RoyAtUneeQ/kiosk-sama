import { BaseOutgoingInstruction } from "./BaseOutgoingInstruction";

export class UserInstruction extends BaseOutgoingInstruction {
    async generate(): Promise<string> {
        return this.payload.text;
    }
}       