import { useEffect, useRef } from 'react';
import { useSession, useSessionStore } from '@/contexts/SessionContext';
import { useConfig } from '@/hooks/useConfig';
import { SessionStatus } from '@/contexts/types/SessionStatus';
import { TopicListenerFactory, getAllTopicIds } from '@/factories/TopicListenerFactory';
import type { PubSubClient, Subscription, PubSubMessage } from 'uneeq-state-manager';

/**
 * Initialize and manage pub/sub topic subscriptions for the session.
 *
 * Subscribes to all registered topics when the session becomes LIVE,
 * routes incoming messages to appropriate topic listeners via the factory,
 * and handles proper cleanup on unmount or session end.
 *
 * This hook requires:
 * - Config loaded with stateManager enabled
 * - Session status to be LIVE
 * - PersistentStateWrapper available in session context (initialized by useStateManager)
 *
 * @example
 * ```tsx
 * export const MyComponent = () => {
 *   useTopicSubscriptions(); // Initialize in your component
 *   // ...
 * };
 * ```
 */
export const useTopicSubscriptions = () => {
  const { config, loading: configLoading } = useConfig();
  const { state } = useSession();
  const pubsubClientRef = useRef<PubSubClient | null>(null);
  const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());

  useEffect(() => {
    console.log('[TopicSubscriptions] 🔄 Effect triggered');
    console.log('[TopicSubscriptions] State check:', {
      configLoading,
      stateManagerEnabled: config?.stateManager?.enabled,
      sessionStatus: state.status,
      persistExists: !!state.persist,
      sessionId: state.uneeq?.options?.sessionId,
      pubsubClientExists: !!pubsubClientRef.current,
      subscriptionCount: subscriptionsRef.current.size,
    });

    // Early return if already initialized
    if (pubsubClientRef.current) {
      console.log('[TopicSubscriptions] ⏭️  Already initialized, skipping');
      return;
    }

    // Check initialization conditions
    const shouldInitialize =
      !configLoading &&
      config?.stateManager?.enabled === true &&
      state.status === SessionStatus.LIVE &&
      state.persist !== null &&
      !pubsubClientRef.current;

    if (!shouldInitialize) {
      console.log('[TopicSubscriptions] ⏸️  Conditions not met for initialization:', {
        configLoading,
        enabled: config?.stateManager?.enabled,
        status: state.status,
        expectedStatus: SessionStatus.LIVE,
        persistExists: !!state.persist,
        pubsubClientExists: !!pubsubClientRef.current,
      });
      return;
    }

    try {
      console.log('[TopicSubscriptions] 🔧 Initializing topic subscriptions');
      console.log('[TopicSubscriptions] Config:', {
        workspaceId: config.stateManager!.workspaceId,
        endpoint: config.stateManager!.endpoint,
      });

      const sessionId = state.uneeq?.options?.sessionId;
      if (!sessionId) {
        console.error('[TopicSubscriptions] ❌ Cannot initialize: sessionId is undefined');
        return;
      }
      console.log('[TopicSubscriptions] SessionId:', sessionId);

      // Get raw StateManager from persist wrapper and initialize pubsub client
      const rawManager = state.persist!.getRawInstance();
      if (!rawManager) {
        console.error('[TopicSubscriptions] ❌ Cannot initialize: raw StateManager is unavailable');
        return;
      }

      console.log('[TopicSubscriptions] Getting PubSubClient from StateManager...');
      const pubsubClient = rawManager.pubsub(config.stateManager!.workspaceId, sessionId);
      pubsubClientRef.current = pubsubClient;
      console.log('[TopicSubscriptions] PubSubClient obtained');

      // Get all registered topic IDs
      const topicIds = getAllTopicIds();
      console.log('[TopicSubscriptions] 📋 Registered topics:', topicIds);

      if (topicIds.length === 0) {
        console.warn('[TopicSubscriptions] ⚠️  No topics registered, skipping subscriptions');
      } else {
        // Subscribe to each topic, routing messages to appropriate listeners
        topicIds.forEach((topicId) => {
          try {
            console.log(`[TopicSubscriptions] 📝 Subscribing to topic: ${topicId}`);

            const subscription = pubsubClient.subscribe(topicId, (message: PubSubMessage) => {
              console.log(`[TopicSubscriptions] 📨 Message received on ${topicId}:`, message.data);

              try {
                // Get the topic listener from the factory
                const listener = TopicListenerFactory(topicId);
                if (!listener) {
                  console.warn(
                    `[TopicSubscriptions] ⚠️  No listener found for topic ${topicId}, message dropped`
                  );
                  return;
                }

                // Get fresh session state to avoid stale closure
                const currentSession = useSessionStore.getState();

                // Execute the listener with the message and current session
                console.log(`[TopicSubscriptions] 🎯 Executing listener for ${topicId}`);
                listener.execute(message, currentSession);
                console.log(`[TopicSubscriptions] ✅ Listener executed successfully for ${topicId}`);
              } catch (error) {
                console.error(
                  `[TopicSubscriptions] ❌ Error executing listener for ${topicId}:`,
                  error
                );
                console.error('[TopicSubscriptions] Error details:', {
                  message: error instanceof Error ? error.message : 'Unknown error',
                  stack: error instanceof Error ? error.stack : undefined,
                });
              }
            });

            subscriptionsRef.current.set(topicId, subscription);
            console.log(`[TopicSubscriptions] ✅ Subscribed to topic: ${topicId}`);
          } catch (error) {
            console.error(`[TopicSubscriptions] ❌ Failed to subscribe to ${topicId}:`, error);
            console.error('[TopicSubscriptions] Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
            });
          }
        });
      }

      // Connect the pubsub client
      console.log('[TopicSubscriptions] 🔗 Connecting PubSubClient...');
      pubsubClient
        .connect()
        .then(() => {
          console.log('[TopicSubscriptions] ✅ PubSubClient connected successfully');
        })
        .catch((error: unknown) => {
          console.error('[TopicSubscriptions] ❌ Failed to connect PubSubClient:', error);
          console.error('[TopicSubscriptions] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
        });
    } catch (error) {
      console.error('[TopicSubscriptions] ❌ Failed to initialize topic subscriptions:', error);
      console.error('[TopicSubscriptions] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    // Cleanup on unmount or session end
    return () => {
      console.log('[TopicSubscriptions] 🧹 Cleaning up topic subscriptions');

      if (pubsubClientRef.current) {
        try {
          // Unsubscribe from all topics
          subscriptionsRef.current.forEach((subscription, topicId) => {
            try {
              console.log(`[TopicSubscriptions] 🔌 Unsubscribing from topic: ${topicId}`);
              subscription.unsubscribe();
              console.log(`[TopicSubscriptions] ✅ Unsubscribed from topic: ${topicId}`);
            } catch (error) {
              console.warn(
                `[TopicSubscriptions] ⚠️  Failed to unsubscribe from ${topicId}:`,
                error
              );
            }
          });
          subscriptionsRef.current.clear();

          // Disconnect the pubsub client
          console.log('[TopicSubscriptions] 🔌 Disconnecting PubSubClient...');
          pubsubClientRef.current
            .disconnect()
            .then(() => {
              console.log('[TopicSubscriptions] ✅ PubSubClient disconnected');
            })
            .catch((error) => {
              console.warn('[TopicSubscriptions] ⚠️  Failed to disconnect PubSubClient:', error);
            });

          pubsubClientRef.current = null;
        } catch (error) {
          console.warn('[TopicSubscriptions] ⚠️  Error during cleanup:', error);
        }
      }

      console.log('[TopicSubscriptions] ✅ Cleanup complete');
    };
  }, [configLoading, config?.stateManager?.enabled, state.status, state.persist, state.uneeq?.options?.sessionId]);
};
