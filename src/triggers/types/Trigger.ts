import type { SessionContextType } from "@/contexts/SessionContext";
import type { Message } from "@/types/transport/Message";

export interface Trigger {
    id: number;
    icon?: string;
    special?: boolean;
    description?: string;
    execute: (args: SessionContextType) => Message | void | Promise<Message | void>;
}
