import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { GuidedExperienceData } from "@/types/booking";

export class GuidedExperienceListener implements CustomEventListener {
  type = "guided_experience";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[GuidedExperienceListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.log('[GuidedExperienceListener] ⚠️  State manager not available');
        return;
      }

      console.log('[GuidedExperienceListener] 📊 Fetching from state manager', { key: 'guided_experience' });
      const guidedExperienceData = await session.state.stateManager.get<GuidedExperienceData>('guided_experience');

      const thumbnail =
        guidedExperienceData?.candidate?.pageThumbnailImage ||
        guidedExperienceData?.current?.pageThumbnailImage;

      if (!guidedExperienceData || !thumbnail) {
        console.log('[GuidedExperienceListener] ⚠️  No valid guided experience data found');
        session.actions.setGuidedExperienceData(null);
        return;
      }

      console.log('[GuidedExperienceListener] ✅ Guided experience retrieved', {
        candidateScene: guidedExperienceData.candidate?.sceneKey,
        currentScene: guidedExperienceData.current?.sceneKey,
      });

      session.actions.setGuidedExperienceData(guidedExperienceData);
      session.actions.sendRemoteMessage({
        type: 'guided_experience',
        payload: {
          data: guidedExperienceData
        }
      });

      console.log('[GuidedExperienceListener] 📤 Remote message sent', { type: 'guided_experience' });
    } catch (error) {
      console.error('[GuidedExperienceListener] ❌ Error fetching guided experience data:', error);
      session.actions.setGuidedExperienceData(null);
    }
  }
}
