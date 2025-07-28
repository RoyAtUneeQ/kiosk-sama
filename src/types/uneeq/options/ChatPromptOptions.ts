/**
 * Options for sending a chat prompt to a Uneeq digital human.
 */
export interface ChatPromptOptions {
  /**
   * The text of the chat prompt.
   */
  prompt: string;
  /**
   * Whether to show closed captions for this specific prompt.
   */
  addClosedCaption?: boolean;
}
