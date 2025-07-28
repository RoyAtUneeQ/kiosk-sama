import { type IncomingInstruction } from "@/types";
import { type SessionActions } from "@/contexts/SessionContext";

export class InWeegoInstruction implements IncomingInstruction {
    async execute(value: any, actions: SessionActions): Promise<void> {
        console.log("In Weego Instruction", value);
        console.info("Changing image to %c%s", 'color:rgb(255, 62, 255);', "https://www.skyweaver.net/images/media/wallpapers/wallpaper1.jpg");
        actions.setImageUrl("https://www.skyweaver.net/images/media/wallpapers/wallpaper1.jpg");
    }
}