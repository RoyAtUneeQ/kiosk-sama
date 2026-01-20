import { MessageSender, type Message } from "@/types/transport";

export class MessageFactory {
  static createUserMessage(content: string, prompt: boolean = true): Message {
    return {
      id: crypto.randomUUID(),
      content: content.trim(),
      sender: MessageSender.User,
      timestamp: new Date().toISOString(),
      prompt
    };
  }

  static createAssistantMessage(content: string, id?: string): Message {
    return {
      id: id || crypto.randomUUID(),
      content: content.trim(),
      sender: MessageSender.Assistant,
      timestamp: new Date().toISOString()
    };
  }

  static createSystemMessage(content: string, prompt: boolean = true): Message {
    return {
      id: crypto.randomUUID(),
      content: content.trim(),
      sender: MessageSender.System,
      timestamp: new Date().toISOString(),
      prompt
    };
  }

  static createErrorMessage(error: string | Error): Message {
    const content = error instanceof Error ? error.message : error;
    return this.createSystemMessage(`Error: ${content}`, false);
  }

  static createNotificationMessage(content: string): Message {
    return this.createSystemMessage(content, false);
  }

  static fromRawData(data: Partial<Message> & { content: string; sender: MessageSender }): Message {
    return {
      id: data.id || crypto.randomUUID(),
      content: data.content.trim(),
      sender: data.sender,
      timestamp: data.timestamp || new Date().toISOString(),
      prompt: data.prompt,
      isHistorical: data.isHistorical
    };
  }
}
