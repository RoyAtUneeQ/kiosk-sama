import { useState, useEffect } from 'react';
import type { IconType } from 'react-icons';
import { BsHourglassSplit } from 'react-icons/bs';
import React, { type ReactNode } from 'react';
import { DynamicIconLoaderService } from '@/services';

export function useDynamicIcons(iconNames: (string | undefined)[]) {
  const [loadedIcons, setLoadedIcons] = useState<Record<string, IconType>>({});
  const [iconService] = useState(() => new DynamicIconLoaderService());

  useEffect(() => {
    // Filter out undefined values and load all icons
    const validIconNames = iconNames.filter((name): name is string => !!name);
    
    if (validIconNames.length === 0) {
      return;
    }

    const loadIcons = async () => {
      try {
        const icons = await iconService.loadIconComponents(validIconNames);
        setLoadedIcons(prevIcons => ({
          ...prevIcons,
          ...icons
        }));
      } catch (error) {
        console.error('[useDynamicIcons] Failed to load icons:', error);
      }
    };

    loadIcons();
  }, [iconNames, iconService]);

  const getIconComponent = (iconName: string | undefined): ReactNode => {
    if (!iconName) {
      return React.createElement(BsHourglassSplit);
    }
    
    const IconComponent = loadedIcons[iconName];
    return IconComponent 
      ? React.createElement(IconComponent)
      : React.createElement(BsHourglassSplit);
  };

  return { 
    loadedIcons, 
    getIconComponent,
    isLoading: Object.keys(loadedIcons).length < iconNames.filter(Boolean).length
  };
}
