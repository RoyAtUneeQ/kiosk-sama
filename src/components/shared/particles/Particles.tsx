import React, { useEffect, useMemo, useRef, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ParticlesOptions } from '@/types';
import type { Engine } from '@tsparticles/engine';
import { MoveDirection, OutMode } from '@tsparticles/engine';
import './Particles.scss';

// Guard against multiple engine initializations across mounts/HMR
let engineInitialized = false;
let engineInitializing = false;
let instanceCounter = 0;

interface ParticlesComponentProps {
  options?: ParticlesOptions;
  className?: string;
}

const ParticlesComponent: React.FC<ParticlesComponentProps> = ({
  options = {},
  className = ''
}) => {
  const [initialized, setInitialized] = useState(false);

  const {
    // Only floating circles are supported now
    background = 'transparent',
    color = '#660033',
    count = 80,
    size = { min: 1, max: 5 },
    speed = 2,
    zIndex = -1,
    detectRetina = true,
  } = options;

  // Stable unique id per component instance
  const instanceIdRef = useRef<string | null>(null);
  if (!instanceIdRef.current) {
    instanceIdRef.current = `tsparticles-${++instanceCounter}`;
  }

  useEffect(() => {
    if (engineInitialized) {
      setInitialized(true);
      return;
    }

    if (engineInitializing) {
      const check = setInterval(() => {
        if (engineInitialized) {
          setInitialized(true);
          clearInterval(check);
        }
      }, 50);
      return () => clearInterval(check);
    }

    let cancelled = false;
    engineInitializing = true;
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine as any);
    })
      .then(() => {
        if (!cancelled) {
          engineInitialized = true;
          engineInitializing = false;
          setInitialized(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          engineInitializing = false;
          setInitialized(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const config = useMemo(() => ({
    background: {
      color: { value: background },
    },
    fpsLimit: 120,
    detectRetina,
    particles: {
      color: { value: color },
      number: {
        density: { enable: true },
        value: count,
      },
      opacity: {
        value: { min: 0.3, max: 0.7 },
        animation: { enable: true, speed: 0.2, minimumValue: 0.2, sync: false },
      },
      shape: { type: 'circle' },
      size: {
        value: { min: size.min, max: size.max },
        animation: { enable: true, speed: 1, minimumValue: size.min, sync: false },
      },
      move: {
        direction: MoveDirection.none,
        enable: true,
        outModes: { default: OutMode.out },
        random: true,
        speed: speed,
        straight: false,
        warp: true,
      },
    },
  }) as const, [
    background,
    detectRetina,
    color,
    count,
    size.min,
    size.max,
    speed,
  ]);

  const style = useMemo(
    () => ({
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex,
    }),
    [zIndex]
  );

  if (!initialized) return null;

  return (
    <div className={`particles-wrapper ${className}`}>
      <Particles id={instanceIdRef.current!} options={config as any} style={style} />
    </div>
  );
};

export default React.memo(ParticlesComponent);