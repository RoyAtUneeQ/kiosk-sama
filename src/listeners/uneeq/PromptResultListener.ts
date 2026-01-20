import { EventType } from '@/types';
import type { UneeqEventListener } from '@/types';
import type { SessionContextType } from '@/contexts';
import { MessageFactory } from '@/factories';

export class PromptResultListener implements UneeqEventListener {
  eventType = EventType.PromptResult;

  execute(data: any, session: SessionContextType): void {
    // Extract the assistant's response text from Uneeq PromptResult
    const answerText = data?.response?.text || '';
    
    if (answerText && answerText.trim()) {
      console.log('[PromptResultListener] 💬 Adding assistant message to history:', answerText.substring(0, 100) + '...');
      
      // Add assistant message to history
      session.actions.addMessageToHistory(
        MessageFactory.createAssistantMessage(answerText)
      );
    } else {
      console.warn('[PromptResultListener] ⚠️ No response text found in PromptResult:', data);
    }
  }
}