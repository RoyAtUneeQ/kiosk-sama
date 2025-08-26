import type { SessionContextType } from "@/contexts/SessionContext";
import type { Message } from "@/types/transport/Message";

/**
 * Contract implemented by concrete outgoing instruction generators.
 * Outgoing instructions produce prompt strings or messages to send to backend.
 */
export interface Trigger {
    id: number;

    /** Optional icon name for UI representation. */
    icon?: string;

    /**
     * Produce an instruction string (e.g., a prompt). May be async.
     * @param type - Optional generation variant or hint
     */
    execute: (args: SessionContextType) => Message | void;
}
