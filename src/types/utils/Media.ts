export interface Media {
    type: 'image' | 'video';
    url: string;
    autoPlay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
  }
  