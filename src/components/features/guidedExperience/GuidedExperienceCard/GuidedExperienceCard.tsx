import type { GuidedExperienceData } from '@/types/booking';
import './GuidedExperienceCard.scss';

interface GuidedExperienceCardProps {
  data: GuidedExperienceData;
  onConfirm?: () => void;
  transformImageUrl?: (url: string) => string;
}

function formatCodedLabel(value: string): string {
  return value
    .split(/[&\-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function GuidedExperienceCard({ data, onConfirm, transformImageUrl }: GuidedExperienceCardProps) {
  const rawImageUrl = data.candidate?.pageThumbnailImage || data.current?.pageThumbnailImage;
  const imageUrl = rawImageUrl && transformImageUrl ? transformImageUrl(rawImageUrl) : rawImageUrl;
  const sceneKey = data.candidate?.sceneKey || data.current?.sceneKey;
  const rootEnv = data.candidate?.rootEnv || data.current?.rootEnv;
  const sceneLabel = sceneKey ? formatCodedLabel(sceneKey) : '';
  const envLabel = rootEnv ? formatCodedLabel(rootEnv) : '';

  if (!imageUrl) {
    return null;
  }

  const handleClick = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const ariaLabel = [sceneLabel, envLabel].filter(Boolean).join(', ');

  return (
    <button
      type="button"
      className="guided-experience-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
      onClick={handleClick}
      aria-label={ariaLabel ? `Confirm ${ariaLabel}` : 'Confirm guided experience'}
    >
      {(sceneLabel || envLabel) && (
        <span className="guided-experience-card__labels">
          {sceneLabel && <span className="guided-experience-card__scene">{sceneLabel}</span>}
          {envLabel && <span className="guided-experience-card__env">{envLabel}</span>}
        </span>
      )}
    </button>
  );
}
