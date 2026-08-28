import { useEffect, useMemo, useRef } from 'react';
import { MessageSender } from '@/types/transport';
import { SessionStatus } from '@/contexts/types/SessionStatus';
import { useSession } from '@/contexts/SessionContext';
import { LangGraphService } from '@/services';

export const useLangGraphAdapter = () => {
  const { state, actions } = useSession();
  const lastDispatchedIdRef = useRef<string | null>(null);

  const langgraph = state.config?.langgraph;
  const threadId = state.uneeq?.options?.sessionId;

  // Built during render rather than in an effect: the dispatch effect below reads
  // it, and an effect-assigned ref would be null on the render a turn arrives on.
  const service = useMemo(() => {
    if (!langgraph?.enabled || !langgraph.baseUrl) return null;

    return new LangGraphService({
      baseUrl: langgraph.baseUrl,
      assistantId: langgraph.assistantId,
      multitaskStrategy: langgraph.multitaskStrategy,
      onError: () => actions.setAwaitingPromptResponse(false)
    });
  }, [
    langgraph?.enabled,
    langgraph?.baseUrl,
    langgraph?.assistantId,
    langgraph?.multitaskStrategy,
    actions
  ]);

  useEffect(() => () => service?.cancel(), [service]);

  useEffect(() => {
    if (!service || !threadId || state.status !== SessionStatus.LIVE) return;
    // Nothing is sent before the `messages` topic has a subscriber: the reply comes
    // back on it, and publishing to an empty topic loses the turn silently.
    if (!state.stateManager) return;
    if (state.history.length === 0) return;

    const lastMessage = state.history[state.history.length - 1];

    if (lastMessage.sender !== MessageSender.User) return;
    // A replayed conversation is not a turn to answer. HistorySyncListener adds the
    // whole transcript when the companion phone reconnects, and without this every
    // past message would be sent to the graph again.
    if (lastMessage.isHistorical) return;
    if (lastDispatchedIdRef.current === lastMessage.id) return;

    lastDispatchedIdRef.current = lastMessage.id;
    actions.setAwaitingPromptResponse(true);
    void service.sendTurn(lastMessage.content, threadId);
  }, [service, state.history, state.status, state.stateManager, threadId, actions]);
};
