/**
 * Enum for message sender types.
 * Used to identify who sent a message in the conversation.
 */
export enum MessageSender {
  /** Message from the human user */
  User = 'user',
  
  /** Message from the AI assistant/digital human */
  Assistant = 'assistant',
  
  /** System-generated message (triggers, notifications, etc.) */
  System = 'system'
}
