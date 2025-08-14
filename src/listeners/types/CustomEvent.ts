import type { SessionActions } from "@/contexts/SessionContext";

export interface CustomEvent {
    type: string;
    execute: (data: any, actions: SessionActions) => Promise<void>; 
}