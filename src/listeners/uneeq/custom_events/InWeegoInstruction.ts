import { type SessionActions } from "@/contexts/SessionContext";
import { type CustomEvent } from "@/listeners/types/CustomEvent";

export class InWeegoInstruction implements CustomEvent {
    type = "weego";     
    async execute(data: any, actions: SessionActions): Promise<void> {
        console.log("In Weego Instruction", data);
        console.info("Changing image to %c%s", 'color:rgb(255, 62, 255);', "https://www.skyweaver.net/images/media/wallpapers/wallpaper1.jpg");
        actions.setImageUrl("https://www.skyweaver.net/images/media/wallpapers/wallpaper1.jpg");
    }
}