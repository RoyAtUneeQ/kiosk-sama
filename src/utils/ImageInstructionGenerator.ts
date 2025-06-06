const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const PIXABAY_API_URL = "https://pixabay.com/api/";

// List of landscape-related categories from Pixabay API
const LANDSCAPE_CATEGORIES = [
    'nature', 'travel', 'mountains', 'beach', 'forest', 'sky', 'water', 'ocean',
    'desert', 'field', 'valley', 'canyon', 'waterfall', 'river', 'lake', 'sunset',
    'sunrise', 'mountain', 'cliff', 'island', 'coast', 'bay', 'hills', 'volcano',
    'national park', 'jungle', 'cave', 'aurora', 'northern lights', 'savanna'
];

export class ImageInstructionGenerator {
    
    

    /**
     * Gets the image URL based on the Pixabay image ID
     * @param imageId The Pixabay image ID
     * @returns The URL of the image or an empty string if not found
     */
    async getImageUrlById(imageId: string | number): Promise<string> {
        if (!PIXABAY_API_KEY || PIXABAY_API_KEY === "YOUR_PIXABAY_API_KEY") {
            console.error("Error: Please replace \"YOUR_PIXABAY_API_KEY\" with your actual Pixabay API key.");
            return "";
        }

        const params = new URLSearchParams({
            key: PIXABAY_API_KEY,
            id: imageId.toString(),
        });

        const requestUrl = `${PIXABAY_API_URL}?${params.toString()}`;

        try {
            const response = await fetch(requestUrl);

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return "";
            }

            const data = await response.json();

            if (data.hits && data.hits.length > 0) {
                // Return the large image URL if available, otherwise return the webformat URL
                return data.hits[0].largeImageURL || data.hits[0].webformatURL || "";
            } else {
                console.log(`No image found with ID: '${imageId}'`);
                return "";
            }
        } catch (error) {
            console.error("An error occurred while fetching the image URL:", error);
            return "";
        }
    }

    /**
     * Generates a prompt using a random landscape image
     * @returns A formatted prompt string based on a random landscape image
     */
    async generate(): Promise<string> {
        if (!PIXABAY_API_KEY || PIXABAY_API_KEY === "YOUR_PIXABAY_API_KEY") {
            console.error("Error: Please replace \"YOUR_PIXABAY_API_KEY\" with your actual Pixabay API key.");
            return "";
        }

        // Select a random landscape category
        const randomCategory = LANDSCAPE_CATEGORIES[Math.floor(Math.random() * LANDSCAPE_CATEGORIES.length)];
        
        const params = new URLSearchParams({
            key: PIXABAY_API_KEY,
            q: randomCategory,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            per_page: '100',
            editors_choice: 'true',
            order: 'popular',
            category: 'travel,nature',
            min_width: '1280',
            min_height: '720'
        });

        const requestUrl = `${PIXABAY_API_URL}?${params.toString()}`;

        try {
            const response = await fetch(requestUrl);

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return this.generate(); 
            }

            const data = await response.json();

            if (data.hits && data.hits.length > 0) {
                // Select a random image from the results
                const randomIndex = Math.floor(Math.random() * Math.min(100, data.hits.length));
                const image = data.hits[randomIndex];
                
                // Get tags or use the category as fallback
                const tags = image.tags || randomCategory;
                
                return `Instruction: Create a vivid, one-sentence story inspired by this landscape scene: \`\`\`${tags}\`\`\`. 
                The story should be engaging and capture the essence of the location, using rich, descriptive language that transports the reader. 
                Keep it concise but evocative, focusing on the sensory details that make this place special. 
                Include this tag at the beginning: <uneeq:custom_event name="${image.id}" />`;
            } else {
                console.log(`No landscape images found for category: '${randomCategory}'`);
                return this.generate(); 
            }

        } catch (error) {
            console.error("An error occurred while fetching the landscape image:", error);
            return "";
        }
    }
} 