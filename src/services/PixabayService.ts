export interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  fullHDURL: string;
  imageWidth: number;
  imageHeight: number;
  views: number;
  downloads: number;
  likes: number;
  user: string;
  userImageURL: string;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export class PixabayService {
  private apiKey: string;
  private apiUrl: string;
  private usedImageIds: Set<number> = new Set();

  constructor(url: string, key: string) {
    this.apiKey = key;
    this.apiUrl = url;
  }

  /**
   * Fetch a random beautiful landscape image in HD with consistent proportions
   * Ensures all images are horizontal orientation with minimum Full HD resolution
   * Tries to avoid previously used images
   */
  async getRandomImage(): Promise<PixabayImage | null> {
    try {
      // Generate random page number to get variety
      const randomPage = Math.floor(Math.random() * 10) + 1;
      
      const params = new URLSearchParams({
        key: this.apiKey,
        q: 'landscape nature scenic beautiful mountains ocean forest sunset sunrise',
        image_type: 'photo',
        orientation: 'horizontal',
        category: 'nature',
        min_width: '1920',
        min_height: '1080',
        editors_choice: 'true',
        safesearch: 'true',
        per_page: '20',
        page: randomPage.toString(),
        order: 'popular'
      });

      const response = await fetch(`${this.apiUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status} ${response.statusText}`);
      }

      const data: PixabayResponse = await response.json();
      
      if (data.hits.length === 0) {
        return null;
      }

      // Filter images to ensure consistent aspect ratio (16:9 or close to it)
      const aspectRatioFiltered = data.hits.filter(img => {
        const aspectRatio = img.imageWidth / img.imageHeight;
        return aspectRatio >= 1.6 && aspectRatio <= 1.8; // 16:9 is ~1.778
      });

      // Try to find an unused image from aspect ratio filtered results
      let availableImages = aspectRatioFiltered.filter(img => !this.usedImageIds.has(img.id));
      
      // If no unused images with good aspect ratio, try all filtered images
      if (availableImages.length === 0 && aspectRatioFiltered.length > 0) {
        availableImages = aspectRatioFiltered;
      }
      
      // If still no images, clear cache and use any image from filtered results
      if (availableImages.length === 0) {
        this.usedImageIds.clear();
        availableImages = aspectRatioFiltered.length > 0 ? aspectRatioFiltered : data.hits;
      }

      // Select random image from available ones
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      const selectedImage = availableImages[randomIndex];

      // Mark this image as used
      this.usedImageIds.add(selectedImage.id);

      return selectedImage;
    } catch (error) {
      console.error('Error fetching image from Pixabay:', error);
      return null;
    }
  }

  /**
   * Get the best quality image URL for display
   * Prefers fullHDURL if available, falls back to largeImageURL
   */
  getBestQualityUrl(image: PixabayImage): string {
    return image.fullHDURL || image.largeImageURL || image.webformatURL;
  }

  /**
   * Validate if image has consistent landscape proportions
   */
  isValidLandscapeImage(image: PixabayImage): boolean {
    const aspectRatio = image.imageWidth / image.imageHeight;
    return aspectRatio >= 1.6 && aspectRatio <= 1.8 && 
           image.imageWidth >= 1920 && image.imageHeight >= 1080;
  }

  /**
   * Clear the cache of used image IDs
   */
  clearUsedImages(): void {
    this.usedImageIds.clear();
  }
}
