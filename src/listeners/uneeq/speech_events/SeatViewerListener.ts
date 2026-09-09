import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { SeatViewerData } from "@/types/booking";

export class SeatViewerListener implements CustomEventListener {
  type = "seat_viewer";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[SeatViewerListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.log('[SeatViewerListener] ⚠️  State manager not available');
        return;
      }

      console.log('[SeatViewerListener] 📊 Fetching from state manager', { key: 'seat_viewer' });
      const seatViewerData = await session.state.stateManager.get<SeatViewerData>('seat_viewer');

      const thumbnail =
        seatViewerData?.candidate?.pageThumbnailImage ||
        seatViewerData?.current?.pageThumbnailImage;

      if (!seatViewerData || !thumbnail) {
        console.log('[SeatViewerListener] ⚠️  No valid seat viewer data found');
        session.actions.setSeatViewerData(null);
        return;
      }

      console.log('[SeatViewerListener] ✅ Seat viewer retrieved', {
        candidateScene: seatViewerData.candidate?.sceneKey,
        currentScene: seatViewerData.current?.sceneKey,
      });

      session.actions.setSeatViewerData(seatViewerData);
      session.actions.sendRemoteMessage({
        type: 'seat_viewer',
        payload: {
          data: seatViewerData
        }
      });

      console.log('[SeatViewerListener] 📤 Remote message sent', { type: 'seat_viewer' });
    } catch (error) {
      console.error('[SeatViewerListener] ❌ Error fetching seat viewer data:', error);
      session.actions.setSeatViewerData(null);
    }
  }
}
