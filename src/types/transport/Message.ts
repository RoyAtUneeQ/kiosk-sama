import { MessageSender } from './MessageSender';

export interface Message {
  id: string;
  content: string;
  timestamp: Date | string;
  sender: MessageSender;
  prompt?: boolean;
  isHistorical?: boolean;
  // Set only when `content` had speech markup stripped out of it; what the avatar
  // is given to say, since the tag's position inside the sentence is meaningful.
  speechContent?: string;
}