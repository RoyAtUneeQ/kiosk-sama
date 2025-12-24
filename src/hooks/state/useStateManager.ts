import { useEffect, useRef } from 'react';
import { StateManager } from 'uneeq-state-manager';
import type { PubSubClient, Subscription, PubSubMessage } from 'uneeq-state-manager';
import { SessionStatus } from '@/contexts/types/SessionStatus';
import { useConfiguration } from '@/hooks';
import { useSession, useSessionStore } from '@/contexts/SessionContext';
import { StateManagerService } from '@/services';
import { TopicListenerFactory, getAllTopicIds } from '@/factories/TopicListenerFactory';

export const useStateManager = () => {
  const { config, loading: configLoading } = useConfiguration();
  const { state, actions } = useSession();
  const wrapperRef = useRef<StateManagerService | null>(null);
  const pubsubClientRef = useRef<PubSubClient | null>(null);
  const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());

  useEffect(() => {
    if (wrapperRef.current) return;

    const canInitialize =
      !configLoading &&
      config?.stateManager?.enabled &&
      state.status === SessionStatus.LIVE;

    if (!canInitialize) return;

    const { endpoint, apiKey, workspaceId } = config.stateManager!;
    const sessionId = state.uneeq?.options?.sessionId;
    if (!sessionId) return;

    // Initialize StateManager
    const rawManager = new StateManager({ endpoint, apiKey });
    const wrapper = new StateManagerService(
      rawManager,
      workspaceId,
      () => useSessionStore.getState().state.uneeq?.options?.sessionId
    );

    wrapperRef.current = wrapper;
    actions.setStateManager(wrapper);

    // Create session and persist start timestamp
    rawManager
      .workspace(workspaceId)
      .session(sessionId)
      .create({ ttl: 3600 })
      .then(() => wrapper.set('Started', new Date().toISOString()))
      .catch((err) => console.error('[StateManager] Session creation failed:', err));

    // Setup topic subscriptions
    const pubsubClient = rawManager.pubsub(workspaceId, sessionId);
    pubsubClientRef.current = pubsubClient;

    getAllTopicIds().forEach((topicId) => {
      const subscription = pubsubClient.subscribe(topicId, (message: PubSubMessage) => {
        const listener = TopicListenerFactory(topicId);
        listener?.execute(message, useSessionStore.getState());
      });
      subscriptionsRef.current.set(topicId, subscription);
    });

    pubsubClient.connect().catch((err) => console.error('[PubSub] Connection failed:', err));

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current.clear();
      pubsubClientRef.current?.disconnect().catch(() => {});
      pubsubClientRef.current = null;
      wrapperRef.current?.end().catch(() => {});
      wrapperRef.current = null;
      actions.setStateManager(null);
    };
  }, [configLoading, config?.stateManager?.enabled, state.status, state.uneeq?.options?.sessionId, actions]);
};
