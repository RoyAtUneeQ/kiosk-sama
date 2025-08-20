import { MessageSender } from './MessageSender';

export interface Message {
  id: string;
  content: string;
  timestamp: Date | string;
  sender: MessageSender;
  prompt?: boolean; 
}