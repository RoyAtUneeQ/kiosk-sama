import { useState, useEffect } from 'react';
import type { IconType } from 'react-icons';
import { BsHourglassSplit } from 'react-icons/bs';
import React, { type ReactNode } from 'react';

// Map of icon prefixes to their libraries
const iconLibraries: Record<string, Promise<any>> = {
  Bs: import('react-icons/bs'),
  Md: import('react-icons/md'),
  Fa: import('react-icons/fa'),
  Fi: import('react-icons/fi'),
  Gi: import('react-icons/gi'),
  Hi: import('react-icons/hi'),
  Im: import('react-icons/im'),
  Io: import('react-icons/io'),
  Ri: import('react-icons/ri'),
  Ti: import('react-icons/ti'),
  Vsc: import('react-icons/vsc'),
  Wi: import('react-icons/wi'),
  Ai: import('react-icons/ai'),
  Go: import('react-icons/go'),
  Si: import('react-icons/si'),
  Bi: import('react-icons/bi'),
  Di: import('react-icons/di'),
  Fc: import('react-icons/fc'),
  Gr: import('react-icons/gr'),
  Cg: import('react-icons/cg'),
};

// Extract prefix from icon name (e.g., "MdHistoryEdu" → "Md")
export const getIconPrefix = (iconName: string): string => {
  for (const prefix of Object.keys(iconLibraries)) {
    if (iconName.startsWith(prefix)) {
      return prefix;
    }
  }
  return 'Bs'; // Default to Bootstrap if no match found
};

// Load a single icon component
export const loadIconComponent = async (
  iconName: string
): Promise<IconType | null> => {
  const prefix = getIconPrefix(iconName);
  
  try {
    const iconModule = await iconLibraries[prefix];
    return iconModule[iconName];
  } catch (error) {
    console.error(`Failed to load icon: ${iconName}`, error);
    return null;
  }
};

// Hook to use dynamic icons
export const useDynamicIcons = (iconNames: (string | undefined)[]) => {
  const [loadedIcons, setLoadedIcons] = useState<Record<string, IconType>>({});

  useEffect(() => {
    // Filter out undefined values and load all icons
    const validIconNames = iconNames.filter((name): name is string => !!name);
    
    const loadIcons = async () => {
      for (const iconName of validIconNames) {
        const iconComponent = await loadIconComponent(iconName);
        if (iconComponent) {
          setLoadedIcons(prev => ({
            ...prev,
            [iconName]: iconComponent
          }));
        }
      }
    };

    loadIcons();
  }, [iconNames]);

  // Function to get an icon component
  const getIconComponent = (iconName: string | undefined): ReactNode => {
    if (!iconName) return React.createElement(BsHourglassSplit);
    
    const IconComponent = loadedIcons[iconName];
    return IconComponent 
      ? React.createElement(IconComponent)
      : React.createElement(BsHourglassSplit);
  };

  return { loadedIcons, getIconComponent };
}; 