# Heap Tracking and the Library Registry

## Heap tracker

`binding.getMemoryUsage()` returns a `CppHeapStats` snapshot:

```ts
interface CppHeapStats {
  heapBytes: number;
  peakHeapBytes: number;
  stackBytes: number;
  staticBytes: number;
  allocCount: number;
  freeCount: number;
}
```

The tracker is fed by the ABI layer through `binding.heapTracker.recordAlloc(bytes)`
/ `recordFree(bytes)`; `reset()` zeroes the counters. Values are advisory —
they reflect what the native side reports, not a real read of the C++ heap.

## Library registry

```ts
await binding.loadLibrary('/usr/lib/librenderer.so');
binding.getLibraryStats();   // { loadedCount: 1, totalLoaded: 1, totalUnloaded: 0 }
await binding.unloadLibrary('/usr/lib/librenderer.so');
```

`loadLibrary` / `unloadLibrary` are **no-ops until `initialize()` succeeds**.
The registry records paths and load/unload counts; `libRegistryMaxSize` caps the
number of concurrently-loaded entries. Direct access: `binding.libraryRegistry`
(`load`, `unload`, `isLoaded`, `listLoaded`, `getStats`).
