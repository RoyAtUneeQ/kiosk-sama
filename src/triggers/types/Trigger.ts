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
     * Optional flag to mark this trigger as special with enhanced styling.
     * When set to true, the trigger button will have a vibrant rainbow gradient
     * with pulsing animations and enhanced glow effects to make it stand out.
     * Example: special: true
     */
    special?: boolean;

    /** 
     * Optional fun and engaging description shown as tooltip on hover.
     * Should be playful and inviting to encourage user interaction.
     * Example: "Let's discover this special feature! ✨"
     */
    description?: string;

    /**
     * Produce an instruction string (e.g., a prompt). May be async.
     * @param type - Optional generation variant or hint
     */
    execute: (args: SessionContextType) => Message | void | Promise<Message | void>;
}
