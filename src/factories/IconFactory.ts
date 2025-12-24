import type { IconType } from 'react-icons';
import type { ReactNode } from 'react';
import { useDynamicIcons } from '@/hooks';
import { DynamicIconLoaderService } from '@/services';

const iconService = new DynamicIconLoaderService();

export const getIconPrefix = (iconName: string): string => {
  return iconService.getIconPrefix(iconName);
};

export const loadIconComponent = async (iconName: string): Promise<any> => {
  return iconService.loadIconComponent(iconName);
};

export type IconFactoryInstance = {
  loadedIcons: Record<string, IconType>;
  getIconComponent: (iconName: string | undefined) => ReactNode;
};

export const useIconFactory = (iconNames: (string | undefined)[]): IconFactoryInstance => {
  return useDynamicIcons(iconNames);
};

export const createIconLoader = (iconNames: (string | undefined)[]): IconFactoryInstance => {
  return useDynamicIcons(iconNames);
};


