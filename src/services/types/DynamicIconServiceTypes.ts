/**
 * Options for `DynamicIconLoaderService`.
 *
 * Currently reserved for future use to control caching strategy,
 * preloading, or fallback behavior.
 */
export interface DynamicIconServiceOptions {
  // Placeholder for future options
}

/**
 * Map of icon library prefix (e.g., "Md") to a dynamic import promise
 * that resolves to the module containing React icon components.
 */
export type IconLibraryMap = Record<string, Promise<any>>;
