import { describe, expect, it } from 'vitest';
import { createHeapTracker } from '../src/heap-tracker';

describe('createHeapTracker', () => {
  it('snapshot returns zero stats initially', () => {
    const tracker = createHeapTracker();
    expect(tracker.snapshot()).toEqual({
      heapBytes: 0,
      peakHeapBytes: 0,
      stackBytes: 0,
      staticBytes: 0,
      allocCount: 0,
      freeCount: 0,
    });
  });

  it('recordAlloc increases heapBytes and allocCount', () => {
    const tracker = createHeapTracker();
    tracker.recordAlloc(1024);
    expect(tracker.snapshot().heapBytes).toBe(1024);
    expect(tracker.snapshot().allocCount).toBe(1);

    tracker.recordAlloc(512);
    expect(tracker.snapshot().heapBytes).toBe(1536);
    expect(tracker.snapshot().allocCount).toBe(2);
  });

  it('recordAlloc updates peakHeapBytes', () => {
    const tracker = createHeapTracker();
    tracker.recordAlloc(2000);
    expect(tracker.snapshot().peakHeapBytes).toBe(2000);

    tracker.recordAlloc(500);
    expect(tracker.snapshot().peakHeapBytes).toBe(2500);
  });

  it('recordFree decrements heapBytes and increments freeCount', () => {
    const tracker = createHeapTracker();
    tracker.recordAlloc(1000);
    tracker.recordFree(300);
    expect(tracker.snapshot().heapBytes).toBe(700);
    expect(tracker.snapshot().freeCount).toBe(1);
  });

  it('recordFree clamps heapBytes to 0', () => {
    const tracker = createHeapTracker();
    tracker.recordAlloc(100);
    tracker.recordFree(9999);
    expect(tracker.snapshot().heapBytes).toBe(0);
  });

  it('reset zeroes heapBytes and counts but preserves peakHeapBytes', () => {
    const tracker = createHeapTracker();
    tracker.recordAlloc(3000);
    tracker.reset();
    expect(tracker.snapshot().heapBytes).toBe(0);
    expect(tracker.snapshot().allocCount).toBe(0);
    expect(tracker.snapshot().freeCount).toBe(0);
    expect(tracker.snapshot().peakHeapBytes).toBe(3000);
  });

  it('stackBytes and staticBytes are always 0', () => {
    const tracker = createHeapTracker();
    tracker.recordAlloc(500);
    const snap = tracker.snapshot();
    expect(snap.stackBytes).toBe(0);
    expect(snap.staticBytes).toBe(0);
  });

  it('destroy calls reset', () => {
    const tracker = createHeapTracker();
    tracker.recordAlloc(800);
    tracker.destroy();
    expect(tracker.snapshot().heapBytes).toBe(0);
    expect(tracker.snapshot().allocCount).toBe(0);
  });
});
