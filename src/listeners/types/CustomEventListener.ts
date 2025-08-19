import type { SessionActions } from "@/contexts/SessionContext";

export interface CustomEventListener {
    type: string;
    execute: (data: any, actions: SessionActions) => Promise<void>; 
}