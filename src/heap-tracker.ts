import type { CppHeapStats, HeapTrackerAPI } from './types.js';

export function createHeapTracker(): HeapTrackerAPI {
  let heapBytes = 0;
  let peakHeapBytes = 0;
  let allocCount = 0;
  let freeCount = 0;

  const api: HeapTrackerAPI = {
    recordAlloc(bytes: number): void {
      heapBytes += bytes;
      allocCount++;
      if (heapBytes > peakHeapBytes) {
        peakHeapBytes = heapBytes;
      }
    },

    recordFree(bytes: number): void {
      freeCount++;
      heapBytes = Math.max(0, heapBytes - bytes);
    },

    snapshot(): CppHeapStats {
      return {
        heapBytes,
        peakHeapBytes,
        stackBytes: 0,
        staticBytes: 0,
        allocCount,
        freeCount,
      };
    },

    reset(): void {
      heapBytes = 0;
      allocCount = 0;
      freeCount = 0;
      // peakHeapBytes preserved — tracks lifetime peak
    },

    destroy(): void {
      api.reset();
    },
  };

  return api;
}
