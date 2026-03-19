export function createHeapTracker() {
    let heapBytes = 0;
    let peakHeapBytes = 0;
    let allocCount = 0;
    let freeCount = 0;
    const api = {
        recordAlloc(bytes) {
            heapBytes += bytes;
            allocCount++;
            if (heapBytes > peakHeapBytes) {
                peakHeapBytes = heapBytes;
            }
        },
        recordFree(bytes) {
            freeCount++;
            heapBytes = Math.max(0, heapBytes - bytes);
        },
        snapshot() {
            return {
                heapBytes,
                peakHeapBytes,
                stackBytes: 0,
                staticBytes: 0,
                allocCount,
                freeCount,
            };
        },
        reset() {
            heapBytes = 0;
            allocCount = 0;
            freeCount = 0;
            // peakHeapBytes preserved — tracks lifetime peak
        },
        destroy() {
            api.reset();
        },
    };
    return api;
}
//# sourceMappingURL=heap-tracker.js.map