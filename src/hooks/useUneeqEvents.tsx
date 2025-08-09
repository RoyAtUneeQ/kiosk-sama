import { useEffect, useCallback, useRef } from 'react';
import { EventType, SessionStatus } from '@/types';
import type { Event as UneeqEvent } from '@/types';
import { useSession } from '@/contexts/SessionContext';
import * as IncomingInstructions from '@/instructions/incoming';
import { createAction } from '@/utils';
import { useWebSocket } from './useWebSocket';
import { useConfig } from './useConfig';    

export const useUneeqEvents = (): void => {
  const { actions, state } = useSession();
  const processingRef = useRef(false);
  const { config } = useConfig();
  const { sendAction } = useWebSocket({webSocketUrl: config.websocket.url});

  // Process the queue of events
  const processQueue = useCallback(async () => {
    // Skip if already processing or queue is empty
    if (processingRef.current || !state.uneeqEvents?.length) return;
    
    // Get current event and mark as processing
    const currentEvent = state.uneeqEvents[0] as UneeqEvent;
    processingRef.current = true;
    
    try {
      if (currentEvent) {
        console.groupCollapsed(`[Uneeq Event Executed] %c${currentEvent.uneeqMessageType}`, 'color:rgb(217, 64, 255);'); 
        console.table(currentEvent);
        console.groupEnd();
        
        // Handle event based on type
        switch (currentEvent.uneeqMessageType) {
          case EventType.SessionLive:
          case EventType.DigitalHumanUnmuted:
            actions.setSessionStatus(SessionStatus.LIVE);
            actions.setAwaitingPromptResponse(false);
            break;
            
          case EventType.PromptRequest:
            actions.setAwaitingPromptResponse(true);
            break;
            
          case EventType.PromptResult:
            actions.setAwaitingPromptResponse(false);
            if (state.remoteInfo && currentEvent.promptResult)
              sendAction(
                createAction.sendMessage(
                  state.remoteInfo.connectionId,
                  currentEvent.promptResult.response.text
                )
              );
            break;
          case EventType.SpeechEvent:
            console.log("%c====", 'color:rgb(255, 62, 142);');
            console.log("Speech Event", currentEvent.speechEvent?.param_value);
            
            if (currentEvent.speechEvent) {
              const [type, value] = currentEvent.speechEvent.param_value.split(/_(.+)/).filter(Boolean);
              
              // Dynamically select the instruction based on type
              const InstructionClass = Object.values(IncomingInstructions).find(
                (InstructionClass) => {
                  const instance = new InstructionClass();
                  return instance.type === type;
                }
              );

              if (InstructionClass) {
                const instruction = new InstructionClass();
                await instruction.execute(value, actions);
              } else {
                console.warn(` No instruction found for type: ${type} `);
              }
            }
            break;
            
          case EventType.AvatarStoppedSpeaking:
            actions.setOutgoingInstruction(null);
            actions.setAwaitingPromptResponse(false);
            break;
            
          case EventType.SessionEnded:
          case EventType.SessionDisconnected:
            console.info("Session ended or disconnected");
            break;
        }
      }
    } catch (error) {
      console.error("Error processing event:", error);
    } finally {
      // Remove the processed event
      if (state.uneeqEvents?.length) {
        const nextEvents = state.uneeqEvents.slice(1);
        // Clear current event
        actions.setUneeqEvents([]);
        
        // Reset processing flag immediately after clearing
        processingRef.current = false;
        
        // Schedule remaining events if any
        if (nextEvents.length) {
          // Use requestAnimationFrame for better performance than setTimeout
          requestAnimationFrame(() => {
            actions.setUneeqEvents(nextEvents);
          });
        }
      } else {
        // Reset processing flag
        processingRef.current = false;
      }
    }
  }, [state.uneeqEvents, actions]);

  // Start processing when events are added to the queue
  useEffect(() => {
    if (state.uneeqEvents?.length && !processingRef.current) processQueue();
  }, [state.uneeqEvents, processQueue]);
}; 