import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { ContactDetailsData } from "@/types/booking";

export class ContactDetailsListener implements CustomEventListener {
  type = "contact_details";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[ContactDetailsListener] ContactDetails event received');
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.warn('[ContactDetailsListener] State Manager not available');
        return;
      }

      // Get contacts data from state manager
      const contactsStateData = await session.state.stateManager.get<ContactDetailsData>('contacts');
      
      if (!contactsStateData || !contactsStateData.email || !contactsStateData.phoneNumber) {
        console.log('[ContactDetailsListener] No valid contact data found in contacts state');
        session.actions.setContactDetailsData(null);
        return;
      }

      console.log('[ContactDetailsListener] Found contact data:', contactsStateData);

      // Create ContactDetailsData from the state data
      const contactDetailsData: ContactDetailsData = {
        email: contactsStateData.email,
        phoneNumber: contactsStateData.phoneNumber,
      };

      console.log('[ContactDetailsListener] Created contact details data:', contactDetailsData);

      // Set in state
      session.actions.setContactDetailsData(contactDetailsData);

      // Send to remote
      session.actions.sendRemoteMessage({
        type: 'contact_details',
        payload: {
          data: contactDetailsData
        }
      });
    } catch (error) {
      console.error('[ContactDetailsListener] Error processing contact details:', error);
      session.actions.setContactDetailsData(null);
    }
  }
}
