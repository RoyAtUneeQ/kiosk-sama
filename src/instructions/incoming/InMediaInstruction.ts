import { type IncomingInstruction } from "@/types";
import { type SessionActions } from "@/contexts/SessionContext";

export class InMediaInstruction implements IncomingInstruction {
    async execute(value: any, actions: SessionActions): Promise<void> {
        console.log("In Media Instruction", value);
        actions.setImageUrl(value);
    }
}