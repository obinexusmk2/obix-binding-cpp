# Binding Lifecycle and Configuration

## Factory

```ts
const binding = createCppBinding(config);
```

## `CppBindingConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `ffiPath` | `string` | **required** | Path to the libpolycall shared library (`.so` / `.dll`) |
| `schemaMode` | `'monoglot' \| 'polyglot' \| 'hybrid'` | **required** | Polyglot interop mode |
| `memoryModel` | `'gc' \| 'manual' \| 'hybrid'` | **required** | Memory-management strategy hint |
| `cppStandard` | `'c++11'`–`'c++23'` | — | C++ standard for the schema resolver |
| `compiler` | `'gcc' \| 'clang' \| 'msvc'` | — | Compiler hint |
| `swigEnabled` | `boolean` | — | Enable SWIG polyglot wrapping |
| `smartPointerPolicy` | `'shared_ptr' \| 'unique_ptr' \| 'raw'` | — | Smart-pointer policy hint |
| `exceptionHandling` | `boolean` | — | C++ exception handling enabled |
| `rttEnabled` | `boolean` | — | Runtime type information enabled |
| `libRegistryMaxSize` | `number` | unlimited | Max registered shared-library entries |
| `ffiDescriptor` | `CppFFIDescriptor` | — | Optional structured FFI descriptor (fills `cppStandard`/`compiler`) |

## Lifecycle methods

| Method | Description |
|--------|-------------|
| `initialize(): Promise<void>` | Validates `ffiPath` (non-empty string) and `schemaMode` (valid enum). **Throws** on invalid input. Marks the binding ready. |
| `invoke(fn, args): Promise<unknown>` | Build an envelope for `fn` and dispatch it. Returns the native result, or a `BindingInvokeError` object — **never throws**. |
| `destroy(): Promise<void>` | Tear down every sub-module and mark the binding uninitialised. Not reusable afterwards. |
| `isInitialized(): boolean` | Ready state. |
| `getSchemaMode(): SchemaMode` | The resolved schema mode. |
| `getMemoryUsage()` | C++ memory snapshot (`CppHeapStats`). |

`fn` may be a string, or an object with `functionId` / `id` / `name` — see
[04-ffi-transport-and-abi.md](04-ffi-transport-and-abi.md).

## C++-specific bridge methods

| Method | Description |
|--------|-------------|
| `loadLibrary(path): Promise<void>` | Register a shared-library path (no-op until `initialize()`) |
| `unloadLibrary(path): Promise<void>` | Remove a shared-library path |
| `getLibraryStats(): LibraryRegistryStats` | `{ loadedCount, totalLoaded, totalUnloaded }` |

## Sub-module accessors

```ts
binding.ffiTransport        // FFITransportAPI
binding.heapTracker         // HeapTrackerAPI
binding.libraryRegistry     // LibraryRegistryAPI
binding.schemaResolver      // CppSchemaResolverAPI
```

## Example

```ts
const binding = createCppBinding({
  ffiPath: '/opt/lib/libpolycall.so',
  schemaMode: 'polyglot',
  memoryModel: 'hybrid',
});

await binding.initialize();
const result = await binding.invoke('renderFrame', [1920, 1080]);
console.log(binding.getMemoryUsage());
await binding.destroy();
```
