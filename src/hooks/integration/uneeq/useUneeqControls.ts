import { useEffect } from 'react';
import { CameraHorizontalAnchor, CameraDistanceAnchor } from '@/types';
import { useSession } from '@/contexts/SessionContext';

interface UseUneeqControlsOptions {
  showClosedCaptions?: boolean;
}

export const useUneeqControls = (options: UseUneeqControlsOptions) => {
  const { state } = useSession();

  // VAD control
  useEffect(() => {
    if (!window.uneeq) {
      console.error('Uneeq is not initialized. Cannot update VAD state.');
      return;
    }

    try {
      if (state.vadEnabled) {
        window.uneeq.resumeSpeechRecognition();
      } else {
        window.uneeq.pauseSpeechRecognition();
      }
    } catch (error) {
      console.error('[useUneeqControls] Error updating VAD state:', error);
    }
  }, [state.vadEnabled]);

  // Camera control
  useEffect(() => {
    if (state.camera && window.uneeq) {
      const isHorizontal = Object.values(CameraHorizontalAnchor).includes(
        state.camera as CameraHorizontalAnchor
      );
      const cameraEnum = isHorizontal ? CameraHorizontalAnchor : CameraDistanceAnchor;
      const cameraKey = Object.keys(cameraEnum).find(
        (key) => cameraEnum[key as keyof typeof cameraEnum] === state.camera
      );

      window.uneeq[isHorizontal ? 'cameraAnchorHorizontal' : 'cameraAnchorDistance'](
        cameraKey as string,
        1000
      );
    }
  }, [state.camera]);

  // Closed captions control
  useEffect(() => {
    if (window.uneeq && typeof options.showClosedCaptions !== 'undefined') {
      try {
        window.uneeq.setShowClosedCaptions(options.showClosedCaptions);
      } catch (error) {
        console.error('[useUneeqControls] Error calling setShowClosedCaptions:', error);
      }
    }
  }, [options.showClosedCaptions]);

  // Apply captions during LIVE session with retries
  useEffect(() => {
    if (window.uneeq && state.status === 'LIVE' && typeof options.showClosedCaptions === 'boolean') {
      const applyCaptions = () => {
        try {
          window.uneeq?.setShowClosedCaptions(options.showClosedCaptions as boolean);
        } catch (error) {
          console.error('[useUneeqControls] Error applying captions during LIVE session:', error);
        }
      };
      applyCaptions();
      setTimeout(applyCaptions, 500);
      setTimeout(applyCaptions, 2000);
    }
  }, [state.status, options.showClosedCaptions]);
};
