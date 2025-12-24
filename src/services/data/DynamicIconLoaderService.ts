import type { IconType } from 'react-icons';
import type {
  DynamicIconServiceOptions,
  IconLibraryMap
} from '../types/DynamicIconServiceTypes';

export class DynamicIconLoaderService {
  private static readonly iconLibraries: IconLibraryMap = {
    Bs: import('react-icons/bs'),
    Md: import('react-icons/md'),
    Fa: import('react-icons/fa'),
    Fa6: import('react-icons/fa6'),
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
    Cg: import('react-icons/cg')
  };

  private cache: Map<string, IconType> = new Map();

  constructor(_options: DynamicIconServiceOptions = {}) {
    // Future options can be added here
  }

  public getIconPrefix(iconName: string): string {
    for (const prefix of Object.keys(DynamicIconLoaderService.iconLibraries)) {
      if (iconName.startsWith(prefix)) {
        return prefix;
      }
    }
    return 'Bs'; // Default to Bootstrap if no match found
  }

  public async loadIconComponent(iconName: string): Promise<IconType | null> {
    // Check cache first
    if (this.cache.has(iconName)) {
      return this.cache.get(iconName)!;
    }

    try {
      const prefix = this.getIconPrefix(iconName);
      const iconModule = await DynamicIconLoaderService.iconLibraries[prefix];
      let iconComponent = iconModule[iconName];

      // If not found and prefix is "Fa", try "Fa6" as fallback
      if (!iconComponent && prefix === 'Fa') {
        const fa6Module = await DynamicIconLoaderService.iconLibraries['Fa6'];
        iconComponent = fa6Module[iconName];
      }

      if (iconComponent) {
        this.cache.set(iconName, iconComponent);
        return iconComponent;
      }

      return null;
    } catch (error) {
      this.handleError('loadIconComponent', error, iconName);
      return null;
    }
  }

  public async loadIconComponents(iconNames: string[]): Promise<Record<string, IconType>> {
    const results: Record<string, IconType> = {};
    
    const loadPromises = iconNames.map(async (iconName) => {
      const iconComponent = await this.loadIconComponent(iconName);
      if (iconComponent) {
        results[iconName] = iconComponent;
      }
    });

    await Promise.all(loadPromises);
    return results;
  }

  public getAvailablePrefixes(): string[] {
    return Object.keys(DynamicIconLoaderService.iconLibraries);
  }

  public clearCache(): void {
    this.cache.clear();
  }

  private handleError(method: string, error: unknown, iconName?: string): void {
    const context = iconName ? ` for icon: ${iconName}` : '';
    console.error(`[DynamicIconLoaderService] ${method} failed${context}:`, error);
  }
}

export default DynamicIconLoaderService; 