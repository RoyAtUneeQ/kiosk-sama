import type { OutgoingInstruction } from "@/types/instructions";
import { 
    OutRandomActionStoryInstruction,
    UserInstruction 
} from "@/instructions/outgoing";

/**
 * Factory for creating instruction instances - follows the same pattern as ActionFactory
 */
export const createOutgoingInstruction = {
    /**
     * Creates an instruction for generating images/stories
     */
    generateImage: (payload: any): OutgoingInstruction => {
        return new OutRandomActionStoryInstruction(payload);
    },
    
    /**
     * Creates a user instruction
     */
    userInstruction: (payload: any): OutgoingInstruction => {
        return new UserInstruction(payload);
    }
};