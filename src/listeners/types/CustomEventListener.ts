import type { SessionContextType } from "@/contexts/SessionContext";

export interface CustomEventListener {
    type: string;
    execute: (data: any, session: SessionContextType) => Promise<void>; 
}