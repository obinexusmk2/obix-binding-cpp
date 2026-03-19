# @obinexusltd/obix-binding-cpp

TypeScript bindings for OBIX C++ runtime integration through the libpolycall ABI bridge.

## Overview

`@obinexusltd/obix-binding-cpp` provides a modular bridge API for:

- Creating and initializing a C++ binding configuration
- Invoking ABI-backed polyglot functions with structured envelopes
- Returning consistent typed invocation errors
- Tracking heap allocation state across the binding lifecycle
- Managing loaded shared libraries (`.so` / `.dll`) via a library registry
- Resolving schema capabilities per `SchemaMode` (SWIG, RTTI, exception handling)

## Installation

```bash
npm install @obinexusltd/obix-binding-cpp
```

## Usage

```ts
import { createCppBinding } from '@obinexusltd/obix-binding-cpp';

const binding = createCppBinding({
  ffiPath: '/path/to/libpolycall.so',
  cppStandard: 'c++20',
  schemaMode: 'hybrid',
  memoryModel: 'manual',
  compiler: 'clang',
  swigEnabled: true,
  rttEnabled: true,
});

await binding.initialize();

// Invoke a polyglot function
const result = await binding.invoke('renderFrame', [width, height]);
console.log(result);

// Load a shared library into the registry
await binding.loadLibrary('/usr/lib/librenderer.so');
console.log(binding.getLibraryStats());

// Unload when done
await binding.unloadLibrary('/usr/lib/librenderer.so');

// Inspect heap usage
const heap = binding.getMemoryUsage();
console.log(heap.heapBytes, heap.peakHeapBytes);

await binding.destroy();
```

## API

### `createCppBinding(config: CppBindingConfig): CppBindingBridge`

Creates a binding bridge with lifecycle and invocation methods.

#### Lifecycle

| Method | Description |
|--------|-------------|
| `initialize()` | Validates `ffiPath` and `schemaMode`, marks binding ready |
| `invoke(fn, args)` | Invokes a polyglot function through the libpolycall ABI |
| `destroy()` | Tears down all sub-modules and marks binding uninitialized |
| `isInitialized()` | Returns whether the binding is ready |

#### Memory

| Method | Description |
|--------|-------------|
| `getMemoryUsage()` | Returns `CppHeapStats` snapshot |

#### Library management

| Method | Description |
|--------|-------------|
| `loadLibrary(path)` | Registers a shared library path (no-op if not initialized) |
| `unloadLibrary(path)` | Removes a shared library path |
| `getLibraryStats()` | Returns `LibraryRegistryStats` with load/unload counts |

#### Sub-module accessors

| Accessor | Type | Description |
|----------|------|-------------|
| `ffiTransport` | `FFITransportAPI` | Raw envelope builder and dispatcher |
| `heapTracker` | `HeapTrackerAPI` | C++ heap allocation tracker |
| `libraryRegistry` | `LibraryRegistryAPI` | Loaded shared library registry |
| `schemaResolver` | `CppSchemaResolverAPI` | Schema mode resolver and validator |

### `CppBindingConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `ffiPath` | `string` | required | Path to the libpolycall shared library |
| `schemaMode` | `'monoglot' \| 'polyglot' \| 'hybrid'` | required | Polyglot interop mode |
| `memoryModel` | `'gc' \| 'manual' \| 'hybrid'` | required | Memory management strategy |
| `cppStandard` | `CppStandard` | `undefined` | C++ standard (`'c++11'`–`'c++23'`) |
| `compiler` | `CppCompiler` | `undefined` | Compiler hint (`'gcc'`, `'clang'`, `'msvc'`) |
| `swigEnabled` | `boolean` | `undefined` | Enable SWIG polyglot wrapping |
| `smartPointerPolicy` | `string` | `undefined` | `'shared_ptr'`, `'unique_ptr'`, or `'raw'` |
| `exceptionHandling` | `boolean` | `undefined` | C++ exception handling enabled |
| `rttEnabled` | `boolean` | `undefined` | Runtime type information enabled |
| `libRegistryMaxSize` | `number` | unlimited | Maximum registered library entries |

## Error model

Invocation errors are returned as typed objects (never thrown):

| Code | Meaning |
|------|---------|
| `NOT_INITIALIZED` | `invoke` called before `initialize()` |
| `MISSING_SYMBOL` | No `__obixAbiInvoker` registered, or function identifier missing |
| `INVOCATION_FAILED` | The ABI invoker threw during dispatch |

Each error includes the full `InvocationEnvelope` for debugging at ABI boundaries.

## Schema capabilities by mode

| Capability | `monoglot` | `hybrid` | `polyglot` |
|-----------|-----------|---------|-----------|
| `swigEnabled` | No | Yes | Yes |
| `rttEnabled` | No | Yes | Yes |
| `exceptionHandlingEnabled` | Yes | Yes | Yes |
| `supportsMultiLanguage` | No | Yes | Yes |

## Development

```bash
npm run build
npm test
```

## License

MIT
