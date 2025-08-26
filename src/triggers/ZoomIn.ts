import type { SessionContextType } from "@/contexts/SessionContext";
import type { Trigger } from "./types/Trigger";
import { CameraDistanceAnchor } from "@/types/uneeq/constants";

export class ZoomInTrigger implements Trigger {
    id: number = 1;
    icon: string = "GrAdd";

    execute({state, actions}: SessionContextType): void {
        console.log("ZoomInTrigger");
        
        const currentCamera = state.camera;
        const cameraProgression = Object.values(CameraDistanceAnchor);
        
        // Find current position in the progression
        const currentIndex = cameraProgression.findIndex(anchor => anchor === currentCamera);
        
        // If current camera is not a distance anchor or not found, start from full_shot
        if (currentIndex === -1) {
            console.log("Current camera is not a distance anchor, setting to full_shot");
            actions.setCamera(CameraDistanceAnchor.full_shot);
            return;
        }
        
        // If already at the closest position (close_up), do nothing
        if (currentIndex === 0) {
            console.log("Already at closest camera position (close_up), cannot zoom in further");
            return;
        }
        
        // Move one step toward the closest position
        const nextIndex = currentIndex - 1;
        const nextCamera = cameraProgression[nextIndex];
        
        console.log(`Zooming in from ${currentCamera} to ${nextCamera}`);
        actions.setCamera(nextCamera);
    }
}   