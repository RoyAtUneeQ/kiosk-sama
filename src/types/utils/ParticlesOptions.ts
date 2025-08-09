export interface ParticlesOptions {
  /** Preset particle configuration */
  preset?: 'floating' | 'stars' | 'bubbles' | 'fireflies' | 'snow' | 'matrix';
  /** Background color (transparent if not specified) */
  background?: string;
  /** Primary particle color */
  color?: string;
  /** Secondary particle color for gradients/links */
  secondaryColor?: string;
  /** Number of particles */
  count?: number;
  /** Particle size range */
  size?: {
    min: number;
    max: number;
  };
  /** Animation speed */
  speed?: number;
  /** Enable particle interactions on hover/click */
  interactive?: boolean;
  /** Z-index for layering */
  zIndex?: number;
  /** Enable retina display detection */
  detectRetina?: boolean;
}