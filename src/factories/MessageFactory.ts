import { MessageSender, type Message } from "@/types/transport";

/**
 * Factory for creating Message objects with consistent patterns and sensible defaults.
 * Simplifies message creation throughout the application and reduces boilerplate code.
 */
export class MessageFactory {
  
  /**
   * Creates a user message (typically from chat input or speech-to-text)
   * @param content - The message content
   * @param prompt - Whether this message should trigger a prompt (default: true)
   * @returns A properly formatted user message
   */
  static createUserMessage(content: string, prompt: boolean = true): Message {
    return {
      id: crypto.randomUUID(),
      content: content.trim(),
      sender: MessageSender.User,
      timestamp: new Date().toISOString(),
      prompt
    };
  }

  /**
   * Creates an assistant message (typically from AI responses)
   * @param content - The message content
   * @param id - Optional custom ID (defaults to random UUID)
   * @returns A properly formatted assistant message
   */
  static createAssistantMessage(content: string, id?: string): Message {
    return {
      id: id || crypto.randomUUID(),
      content: content.trim(),
      sender: MessageSender.Assistant,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates a system message (typically from triggers, notifications, errors)
   * @param content - The message content
   * @param prompt - Whether this message should trigger a prompt (default: true)
   * @returns A properly formatted system message
   */
  static createSystemMessage(content: string, prompt: boolean = true): Message {
    return {
      id: crypto.randomUUID(),
      content: content.trim(),
      sender: MessageSender.System,
      timestamp: new Date().toISOString(),
      prompt
    };
  }

  /**
   * Creates an error system message with standardized formatting
   * @param error - Error message or Error object
   * @returns A properly formatted system error message
   */
  static createErrorMessage(error: string | Error): Message {
    const content = error instanceof Error ? error.message : error;
    return this.createSystemMessage(`Error: ${content}`, false);
  }

  /**
   * Creates a notification system message (typically non-prompt messages)
   * @param content - The notification content
   * @returns A properly formatted system notification message
   */
  static createNotificationMessage(content: string): Message {
    return this.createSystemMessage(content, false);
  }

  /**
   * Creates a message from raw data (useful for WebSocket messages or API responses)
   * @param data - Raw message data
   * @returns A properly formatted message with type safety
   */
  static fromRawData(data: Partial<Message> & { content: string; sender: MessageSender }): Message {
    return {
      id: data.id || crypto.randomUUID(),
      content: data.content.trim(),
      sender: data.sender,
      timestamp: data.timestamp || new Date().toISOString(),
      prompt: data.prompt
    };
  }
}
