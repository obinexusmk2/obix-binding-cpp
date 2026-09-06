export type { SchemaMode, InvocationEnvelope, BindingInvokeError, BindingAbiInvoker, CppStandard, CppCompiler, CppFFIDescriptor, CppBindingConfig, CppBindingBridge, CppHeapStats, HeapTrackerAPI, LoadedLibrary, LibraryRegistryStats, LibraryRegistryAPI, CppSchemaResolverConfig, CppResolvedSchema, CppSchemaResolverAPI, FFITransportConfig, FFITransportAPI, } from './types.js';
export { createFFITransport, normalizeFunctionIdentifier } from './ffi-transport.js';
export { createHeapTracker } from './heap-tracker.js';
export { createLibraryRegistry } from './library-registry.js';
export { createSchemaResolver } from './schema-resolver.js';
import type { CppBindingBridge, CppBindingConfig } from './types.js';
export declare function createCppBinding(config: CppBindingConfig): CppBindingBridge;
//# sourceMappingURL=index.d.ts.map