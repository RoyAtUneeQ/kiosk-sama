import { type SessionActions } from "@/contexts/SessionContext";

export type IncomingInstruction = {
    execute: (value: any, actions: SessionActions) => Promise<void> | void; 
}