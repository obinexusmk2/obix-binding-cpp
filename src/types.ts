/**
 * OBIX C++ Binding — shared types
 */

// ── Shared FFI / Envelope ─────────────────────────────────────────────────────

export type SchemaMode = 'monoglot' | 'polyglot' | 'hybrid';

export interface InvocationEnvelope {
  functionId: string;
  args: unknown[];
  metadata: {
    schemaMode: SchemaMode;
    binding: string;
    timestampMs: number;
    ffiPath: string;
  };
}

export interface BindingInvokeError {
  code: 'NOT_INITIALIZED' | 'MISSING_SYMBOL' | 'INVOCATION_FAILED';
  message: string;
  envelope: InvocationEnvelope;
  cause?: unknown;
}

export interface BindingAbiInvoker {
  invoke(envelopeJson: string): unknown | Promise<unknown>;
}

// ── FFI Transport ─────────────────────────────────────────────────────────────

export interface FFITransportConfig {
  ffiPath: string;
  schemaMode: SchemaMode;
  bindingName: string;
}

export interface FFITransportAPI {
  buildEnvelope(functionId: string, args: unknown[]): InvocationEnvelope;
  dispatch(envelope: InvocationEnvelope): Promise<unknown>;
  destroy(): void;
}

// ── C++-specific descriptor ───────────────────────────────────────────────────

export type CppStandard = 'c++11' | 'c++14' | 'c++17' | 'c++20' | 'c++23';

export type CppCompiler = 'gcc' | 'clang' | 'msvc';

export interface CppFFIDescriptor {
  ffiPath: string;
  cppStandard: CppStandard;
  compiler: CppCompiler;
  swigEnabled: boolean;
  rttEnabled: boolean;
}

export interface CppBindingConfig {
  ffiPath: string;
  cppStandard?: CppStandard;
  schemaMode: SchemaMode;
  memoryModel: 'gc' | 'manual' | 'hybrid';
  compiler?: CppCompiler;
  swigEnabled?: boolean;
  smartPointerPolicy?: 'shared_ptr' | 'unique_ptr' | 'raw';
  exceptionHandling?: boolean;
  rttEnabled?: boolean;
  libRegistryMaxSize?: number;
  ffiDescriptor?: CppFFIDescriptor;
}

// ── Heap Tracker ──────────────────────────────────────────────────────────────

export interface CppHeapStats {
  heapBytes: number;
  peakHeapBytes: number;
  stackBytes: number;
  staticBytes: number;
  allocCount: number;
  freeCount: number;
}

export interface HeapTrackerAPI {
  recordAlloc(bytes: number): void;
  recordFree(bytes: number): void;
  snapshot(): CppHeapStats;
  reset(): void;
  destroy(): void;
}

// ── Library Registry ──────────────────────────────────────────────────────────

export interface LoadedLibrary {
  path: string;
  loadedAtMs: number;
  handle: string;
}

export interface LibraryRegistryStats {
  loadedCount: number;
  totalLoaded: number;
  totalUnloaded: number;
}

export interface LibraryRegistryAPI {
  load(path: string): void;
  unload(path: string): void;
  isLoaded(path: string): boolean;
  listLoaded(): string[];
  getStats(): LibraryRegistryStats;
  destroy(): void;
}

// ── Schema Resolver ──────────────────────────────────────────────────────────

export interface CppSchemaResolverConfig {
  schemaMode: SchemaMode;
  cppStandard?: CppStandard;
  compiler?: CppCompiler;
}

export interface CppResolvedSchema {
  mode: SchemaMode;
  cppStandard: string;
  supportsMultiLanguage: boolean;
  swigEnabled: boolean;
  exceptionHandlingEnabled: boolean;
  rttEnabled: boolean;
}

export interface CppSchemaResolverAPI {
  resolve(): CppResolvedSchema;
  validate(mode: SchemaMode): boolean;
  getMode(): SchemaMode;
  destroy(): void;
}

// ── Main Bridge ──────────────────────────────────────────────────────────────

export interface CppBindingBridge {
  initialize(): Promise<void>;
  invoke(fn: string | object, args: unknown[]): Promise<unknown>;
  destroy(): Promise<void>;
  getMemoryUsage(): CppHeapStats;
  getSchemaMode(): SchemaMode;
  isInitialized(): boolean;
  loadLibrary(path: string): Promise<void>;
  unloadLibrary(path: string): Promise<void>;
  getLibraryStats(): LibraryRegistryStats;

  readonly ffiTransport: FFITransportAPI;
  readonly heapTracker: HeapTrackerAPI;
  readonly libraryRegistry: LibraryRegistryAPI;
  readonly schemaResolver: CppSchemaResolverAPI;
}
