import type {
  LibraryRegistryAPI,
  LibraryRegistryStats,
  LoadedLibrary,
} from './types.js';

export function createLibraryRegistry(): LibraryRegistryAPI {
  const libraries = new Map<string, LoadedLibrary>();
  let totalLoaded = 0;
  let totalUnloaded = 0;

  const api: LibraryRegistryAPI = {
    load(path: string): void {
      if (libraries.has(path)) return; // idempotent
      libraries.set(path, {
        path,
        loadedAtMs: Date.now(),
        handle: `handle-${totalLoaded}`,
      });
      totalLoaded++;
    },

    unload(path: string): void {
      if (!libraries.has(path)) return; // idempotent
      libraries.delete(path);
      totalUnloaded++;
    },

    isLoaded(path: string): boolean {
      return libraries.has(path);
    },

    listLoaded(): string[] {
      return Array.from(libraries.keys());
    },

    getStats(): LibraryRegistryStats {
      return {
        loadedCount: libraries.size,
        totalLoaded,
        totalUnloaded,
      };
    },

    destroy(): void {
      libraries.clear();
    },
  };

  return api;
}
