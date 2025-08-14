import type { IconType } from 'react-icons';
import type { ReactNode } from 'react';
import { useDynamicIcons } from '@/hooks';
import { DynamicIconLoaderService } from '@/services';

/**
 * IconFactory
 *
 * Thin wrapper that exposes a factory-flavored API over the dynamic icon loader.
 * This lets the rest of the codebase import from a "factories" namespace
 * while preserving the existing hook implementation under the hood.
 */

// Create a shared service instance for non-React usage
const iconService = new DynamicIconLoaderService();

/**
 * Return the icon library prefix for a given icon name.
 */
export const getIconPrefix = (iconName: string): string => {
  return iconService.getIconPrefix(iconName);
};

/**
 * Load a single icon component by name.
 */
export const loadIconComponent = async (iconName: string): Promise<any> => {
  return iconService.loadIconComponent(iconName);
};

export type IconFactoryInstance = {
  loadedIcons: Record<string, IconType>;
  getIconComponent: (iconName: string | undefined) => ReactNode;
};

// Hook-style factory. Use inside React components only.
/**
 * Hook-style factory. Use inside React components only.
 */
export const useIconFactory = (iconNames: (string | undefined)[]): IconFactoryInstance => {
  return useDynamicIcons(iconNames);
};

// Alias for those who prefer a more factory-ish name
/**
 * Alias for those who prefer a more factory-ish name.
 */
export const createIconLoader = (iconNames: (string | undefined)[]): IconFactoryInstance => {
  return useDynamicIcons(iconNames);
};


