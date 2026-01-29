import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { ContactDetailsData } from "@/types/booking";

export class ContactDetailsListener implements CustomEventListener {
  type = "contact_details";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[ContactDetailsListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.log('[ContactDetailsListener] ⚠️  State manager not available');
        return;
      }

      // Get contacts data from state manager
      console.log('[ContactDetailsListener] 📊 Fetching from state manager', { key: 'contacts' });
      const contactsStateData = await session.state.stateManager.get<ContactDetailsData>('contacts');

      if (!contactsStateData || !contactsStateData.email || !contactsStateData.phoneNumber) {
        console.log('[ContactDetailsListener] ⚠️  No valid contact data found', {
          hasData: !!contactsStateData,
          hasEmail: !!contactsStateData?.email,
          hasPhone: !!contactsStateData?.phoneNumber
        });
        session.actions.setContactDetailsData(null);
        return;
      }

      console.log('[ContactDetailsListener] ✅ Contact details retrieved', {
        email: contactsStateData.email,
        phoneNumber: contactsStateData.phoneNumber
      });

      // Create ContactDetailsData from the state data
      const contactDetailsData: ContactDetailsData = {
        email: contactsStateData.email,
        phoneNumber: contactsStateData.phoneNumber,
      };


      // Set in state
      session.actions.setContactDetailsData(contactDetailsData);

      // Send to remote
      session.actions.sendRemoteMessage({
        type: 'contact_details',
        payload: {
          data: contactDetailsData
        }
      });

      console.log('[ContactDetailsListener] 📤 Remote message sent', { type: 'contact_details' });
    } catch (error) {
      console.error('[ContactDetailsListener] ❌ Error processing contact details:', error);
      session.actions.setContactDetailsData(null);
    }
  }
}
