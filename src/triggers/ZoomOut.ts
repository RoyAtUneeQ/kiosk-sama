import type { SessionContextType } from "@/contexts/SessionContext";
import type { Trigger } from "./types/Trigger";
import { CameraDistanceAnchor } from "@/types/uneeq/constants";

export class ZoomOutTrigger implements Trigger {
    id: number = 2;
    icon: string = "GrSubtract";

    execute({state, actions}: SessionContextType): void {
        console.log("ZoomOutTrigger");
        
        const currentCamera = state.camera;
        const cameraProgression = Object.values(CameraDistanceAnchor);
        
        // Find current position in the progression
        const currentIndex = cameraProgression.findIndex(anchor => anchor === currentCamera);
        
        // If current camera is not a distance anchor or not found, start from close_up
        if (currentIndex === -1) {
            console.log("Current camera is not a distance anchor, setting to close_up");
            actions.setCamera(CameraDistanceAnchor.close_up);
            return;
        }
        
        // If already at the furthest position (full_shot), do nothing
        if (currentIndex === cameraProgression.length - 1) {
            console.log("Already at furthest camera position (full_shot), cannot zoom out further");
            return;
        }
        
        // Move one step toward the furthest position
        const nextIndex = currentIndex + 1;
        const nextCamera = cameraProgression[nextIndex];
        
        console.log(`Zooming out from ${currentCamera} to ${nextCamera}`);
        actions.setCamera(nextCamera);
    }
}