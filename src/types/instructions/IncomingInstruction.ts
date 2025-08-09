import { type SessionActions } from "@/contexts/SessionContext";

export type IncomingInstruction = {
    type: string;
    execute: (value: any, actions: SessionActions) => Promise<void> | void; 
}