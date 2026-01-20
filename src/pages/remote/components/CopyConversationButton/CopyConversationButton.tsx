import './CopyConversationButton.scss';
import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import type { Message } from '@/types/transport/Message';
import { MessageSender } from '@/types/transport/MessageSender';

interface CopyConversationButtonProps {
  messages: Message[];
}

const CopyConversationButton: React.FC<CopyConversationButtonProps> = ({ messages }) => {
  const [copied, setCopied] = useState(false);

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getSenderLabel = (sender: MessageSender): string => {
    switch (sender) {
      case MessageSender.User:
        return 'User';
      case MessageSender.Assistant:
        return 'Assistant';
      case MessageSender.System:
        return 'System';
      default:
        return 'Unknown';
    }
  };

  const convertToMarkdown = (): string => {
    if (messages.length === 0) {
      return '# Conversation\n\nNo messages yet.';
    }

    // Group messages by ID and get the latest version of each
    const messageMap = new Map<string, Message>();
    messages.forEach(message => {
      const existing = messageMap.get(message.id);
      if (!existing) {
        messageMap.set(message.id, message);
      } else {
        const existingTime = typeof existing.timestamp === 'string' 
          ? new Date(existing.timestamp).getTime() 
          : existing.timestamp.getTime();
        const currentTime = typeof message.timestamp === 'string'
          ? new Date(message.timestamp).getTime()
          : message.timestamp.getTime();
        
        if (currentTime > existingTime) {
          messageMap.set(message.id, message);
        }
      }
    });

    // Convert to array and sort by timestamp
    const sortedMessages = Array.from(messageMap.values()).sort((a, b) => {
      const timeA = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp.getTime();
      const timeB = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp.getTime();
      return timeA - timeB;
    });

    // Build markdown
    let markdown = '# Conversation Transcript\n\n';
    markdown += `*Generated on ${formatTimestamp(new Date())}*\n\n`;
    markdown += `**Total Messages:** ${sortedMessages.length}\n\n`;
    markdown += '---\n\n';

    sortedMessages.forEach((message, index) => {
      const senderLabel = getSenderLabel(message.sender);
      const timestamp = formatTimestamp(message.timestamp);
      
      markdown += `## Message ${index + 1}\n\n`;
      markdown += `**${senderLabel}** • *${timestamp}*\n\n`;
      markdown += `${message.content}\n\n`;
      markdown += '---\n\n';
    });

    return markdown;
  };

  const handleCopy = async () => {
    try {
      const markdown = convertToMarkdown();
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy conversation:', error);
    }
  };

  return (
    <button
      className="icon-button copy-conversation-button"
      onClick={handleCopy}
      aria-label="Copy conversation"
      title="Copy conversation as markdown"
    >
      {copied ? <FiCheck className="check-icon" /> : <FiCopy />}
      <div className="tooltip" role="tooltip">
        <div className="tooltip-title">{copied ? 'Copied!' : 'Copy Conversation'}</div>
        <div className="tooltip-row">
          <span className="value">{messages.length} messages</span>
        </div>
      </div>
    </button>
  );
};

export default CopyConversationButton;
