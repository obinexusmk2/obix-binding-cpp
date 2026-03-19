/**
 * OBIX C++ Binding
 * Legacy system integration, embedded targets
 * Connects libpolycall FFI/polyglot bridge to C++ runtime
 */

// ── Type re-exports ───────────────────────────────────────────────────────────
export type {
  SchemaMode,
  InvocationEnvelope,
  BindingInvokeError,
  BindingAbiInvoker,
  CppStandard,
  CppCompiler,
  CppFFIDescriptor,
  CppBindingConfig,
  CppBindingBridge,
  CppHeapStats,
  HeapTrackerAPI,
  LoadedLibrary,
  LibraryRegistryStats,
  LibraryRegistryAPI,
  CppSchemaResolverConfig,
  CppResolvedSchema,
  CppSchemaResolverAPI,
  FFITransportConfig,
  FFITransportAPI,
} from './types.js';

// ── Sub-module factory re-exports ─────────────────────────────────────────────
export { createFFITransport, normalizeFunctionIdentifier } from './ffi-transport.js';
export { createHeapTracker } from './heap-tracker.js';
export { createLibraryRegistry } from './library-registry.js';
export { createSchemaResolver } from './schema-resolver.js';

// ── Imports for the main factory ──────────────────────────────────────────────
import type {
  CppBindingBridge,
  CppBindingConfig,
  CppHeapStats,
  LibraryRegistryStats,
} from './types.js';
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
export function createCppBinding(config: CppBindingConfig): CppBindingBridge {
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

  const bridge: CppBindingBridge = {
    async initialize(): Promise<void> {
      if (typeof config.ffiPath !== 'string' || config.ffiPath.trim().length === 0) {
        throw new Error(`Invalid ffiPath: ${config.ffiPath}`);
      }
      if (!schemaResolver.validate(config.schemaMode)) {
        throw new Error(`Invalid schemaMode: ${config.schemaMode}`);
      }
      initialized = true;
    },

    async invoke(fn: string | object, args: unknown[]): Promise<unknown> {
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

    async destroy(): Promise<void> {
      heapTracker.destroy();
      libraryRegistry.destroy();
      ffiTransport.destroy();
      schemaResolver.destroy();
      initialized = false;
    },

    getMemoryUsage(): CppHeapStats {
      return heapTracker.snapshot();
    },

    getSchemaMode() {
      return schemaResolver.getMode();
    },

    isInitialized(): boolean {
      return initialized;
    },

    async loadLibrary(path: string): Promise<void> {
      if (!initialized) return;
      libraryRegistry.load(path);
    },

    async unloadLibrary(path: string): Promise<void> {
      if (!initialized) return;
      libraryRegistry.unload(path);
    },

    getLibraryStats(): LibraryRegistryStats {
      return libraryRegistry.getStats();
    },

    get ffiTransport() { return ffiTransport; },
    get heapTracker() { return heapTracker; },
    get libraryRegistry() { return libraryRegistry; },
    get schemaResolver() { return schemaResolver; },
  };

  return bridge;
}
