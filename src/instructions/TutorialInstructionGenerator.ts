import { AvailableTagsGenerator } from "./AvailableTagsGenerator";

//This class generates a tutorial instruction for the user
export class TutorialInstructionGenerator {
    generate(): string {

        const elements = [
            {
                name: "Zoom in",
                description: `This button will help you understand Digital Human capabilities to zoom in the camera to 
                look closer to me (Avatar) and use the camera_close_up tag to express yourself with ${new AvailableTagsGenerator().getAllEmotionDescriptions()},
                first time to introduce the button create a story about the button. create interactions like "You press the zoom in button and suddenly, voilà—my <custom_event name="camera_close_up" />".
                `,
                tag: 'highlight_zoom_in_button',
            },
            {
                name: "Zoom out",
                description: `This button will help you understand Digital Human capabilities to zoom out the camera to look further away from me (Avatar), 
                you can use the camera_full_shot. create interactions like "The moment you tap the zoom out button, boom, <custom_event name="camera_full_shot" /> my camera's right there, showing the whole scene.".`,
                tag: 'highlight_zoom_out_button',
            },
            {
                name: "Emotion",
                description: `First move the camera to the <uneeq:custom_event name="camera_loose_close_up" /> position, then explain this button will help 
                you understand Digital Human capabilities to express an emotion, for this the camera will be zoomed in to look closer to my face (Avatar) 
                and start a story where you can express yourself with ${new AvailableTagsGenerator().getAllEmotionDescriptions()}`,
                tag: 'highlight_emotion_button',
            },
            {
                name: "Action",
                description: `First move the camera to the <uneeq:custom_event name="camera_full_shot" /> position, then explain this button 
                demonstrates Digital Human action capabilities. The camera will zoom out to show your 
                full-body avatar as you perform actions within an engaging story. The focus is on creating an 
                immersive narrative that naturally incorporates meaningful actions rather than simply showcasing individual movements. 
                The story and action work together to create a compelling experience, use the tag to express yourself with ${new AvailableTagsGenerator().getAllActionDescriptions()}`,
                tag: 'highlight_action_button', //Need to add the word button to avoid tag be read as a tag
            },
            {
                name: "Image",
                description: `This button show you the capabilities to connect a external resource and display it in the scene and create a story around it,
                for this the camera will be zoomed out to look my full body (Avatar) and the image selected will be displayed in the scene then I will tell you one of my stories about it. Let 
                the camera be in the <uneeq:custom_event name="camera_full_shot" /> position`,
                tag: 'highlight_image_button',
            },
        ]

        const baseInstruction = `Instruction: Create a concise, it must be a story telling, with no break lines, and flow naturally, story to explain the following UI elements, preserve the order of the elements. 
        The tag must come before each element explanation, do not show you are following a command, just start directly with somehting like "Let me tell you a little about". Always that you reference a camera anchor, 
        try to use the appropriate camera anchor to express yourself, for example if you are talking about a emotion, use the <uneeq:custom_event name="camera_close_up" /> tag, if you are talking about an action, use the <custom_event name="camera_full_shot" /> tag.
        You have available all this actions actions and emotions, you can use to express yourself or show as example: ${new AvailableTagsGenerator().getAll()}. 
        Tags needs to be always in lowercase, and white blank spaces around the tag and preserve the tag style just using the utf-8 characters.
        Then following you will find the elements to explain, be sure you use the tags, actions, emotions and camera anchor to express yourself:`

        const elementsInstruction = elements.map(element => {
            return `- ${element.name}: ${element.description} and include this tag at the beginning:<uneeq:custom_event name="${element.tag}" />`;
        }).join("\n");
        
        return baseInstruction + elementsInstruction;
    }
}