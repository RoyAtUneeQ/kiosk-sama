export interface ParticlesOptions {
  preset?: 'floating' | 'stars' | 'bubbles' | 'fireflies' | 'snow' | 'matrix';
  background?: string;
  color?: string;
  secondaryColor?: string;
  count?: number;
  size?: {
    min: number;
    max: number;
  };
  speed?: number;
  interactive?: boolean;
  zIndex?: number;
  detectRetina?: boolean;
}