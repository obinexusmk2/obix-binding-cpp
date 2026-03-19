export function createLibraryRegistry() {
    const libraries = new Map();
    let totalLoaded = 0;
    let totalUnloaded = 0;
    const api = {
        load(path) {
            if (libraries.has(path))
                return; // idempotent
            libraries.set(path, {
                path,
                loadedAtMs: Date.now(),
                handle: `handle-${totalLoaded}`,
            });
            totalLoaded++;
        },
        unload(path) {
            if (!libraries.has(path))
                return; // idempotent
            libraries.delete(path);
            totalUnloaded++;
        },
        isLoaded(path) {
            return libraries.has(path);
        },
        listLoaded() {
            return Array.from(libraries.keys());
        },
        getStats() {
            return {
                loadedCount: libraries.size,
                totalLoaded,
                totalUnloaded,
            };
        },
        destroy() {
            libraries.clear();
        },
    };
    return api;
}
//# sourceMappingURL=library-registry.js.map