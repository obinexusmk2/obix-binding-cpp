/**
 * OBIX C++ Binding
 * Legacy system integration, embedded targets
 * Connects libpolycall FFI/polyglot bridge to C++ runtime
 */
// ── Sub-module factory re-exports ─────────────────────────────────────────────
export { createFFITransport, normalizeFunctionIdentifier } from './ffi-transport.js';
export { createHeapTracker } from './heap-tracker.js';
export { createLibraryRegistry } from './library-registry.js';
export { createSchemaResolver } from './schema-resolver.js';
import { createFFITransport, normalizeFunctionIdentifier } from './ffi-transport.js';
import { createHeapTracker } from './heap-tracker.js';
import { createLibraryRegistry } from './library-registry.js';
import { createSchemaResolver } from './schema-resolver.js';
// ── Main factory ──────────────────────────────────────────────────────────────
/**
 * Create a C++ binding to libpolycall
 * @param config Configuration for the binding
 * @returns Bridge for invoking polyglot functions and managing C++ runtime state
 */
export function createCppBinding(config) {
    let initialized = false;
    const ABI_BINDING_NAME = 'cpp';
    const ffiTransport = createFFITransport({
        ffiPath: config.ffiPath,
        schemaMode: config.schemaMode,
        bindingName: ABI_BINDING_NAME,
    });
    const heapTracker = createHeapTracker();
    const libraryRegistry = createLibraryRegistry();
    const schemaResolver = createSchemaResolver({
        schemaMode: config.schemaMode,
        cppStandard: config.cppStandard ?? config.ffiDescriptor?.cppStandard,
        compiler: config.compiler ?? config.ffiDescriptor?.compiler,
    });
    const bridge = {
        async initialize() {
            if (typeof config.ffiPath !== 'string' || config.ffiPath.trim().length === 0) {
                throw new Error(`Invalid ffiPath: ${config.ffiPath}`);
            }
            if (!schemaResolver.validate(config.schemaMode)) {
                throw new Error(`Invalid schemaMode: ${config.schemaMode}`);
            }
            initialized = true;
        },
        async invoke(fn, args) {
            const functionId = normalizeFunctionIdentifier(fn);
            const envelope = ffiTransport.buildEnvelope(functionId ?? '<unknown>', args);
            if (!initialized) {
                return { code: 'NOT_INITIALIZED', message: 'Binding is not initialized', envelope };
            }
            if (!functionId) {
                return { code: 'MISSING_SYMBOL', message: 'Function identifier was not provided', envelope };
            }
            return ffiTransport.dispatch(envelope);
        },
        async destroy() {
            heapTracker.destroy();
            libraryRegistry.destroy();
            ffiTransport.destroy();
            schemaResolver.destroy();
            initialized = false;
        },
        getMemoryUsage() {
            return heapTracker.snapshot();
        },
        getSchemaMode() {
            return schemaResolver.getMode();
        },
        isInitialized() {
            return initialized;
        },
        async loadLibrary(path) {
            if (!initialized)
                return;
            libraryRegistry.load(path);
        },
        async unloadLibrary(path) {
            if (!initialized)
                return;
            libraryRegistry.unload(path);
        },
        getLibraryStats() {
            return libraryRegistry.getStats();
        },
        get ffiTransport() { return ffiTransport; },
        get heapTracker() { return heapTracker; },
        get libraryRegistry() { return libraryRegistry; },
        get schemaResolver() { return schemaResolver; },
    };
    return bridge;
}
//# sourceMappingURL=index.js.map