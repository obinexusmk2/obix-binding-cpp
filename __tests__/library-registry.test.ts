import { describe, expect, it } from 'vitest';
import { createLibraryRegistry } from '../src/library-registry';

describe('createLibraryRegistry', () => {
  it('getStats returns zero counts initially', () => {
    const registry = createLibraryRegistry();
    expect(registry.getStats()).toEqual({
      loadedCount: 0,
      totalLoaded: 0,
      totalUnloaded: 0,
    });
  });

  it('isLoaded returns false for unregistered path', () => {
    const registry = createLibraryRegistry();
    expect(registry.isLoaded('/usr/lib/libfoo.so')).toBe(false);
  });

  it('load registers the library', () => {
    const registry = createLibraryRegistry();
    registry.load('/usr/lib/libfoo.so');
    expect(registry.isLoaded('/usr/lib/libfoo.so')).toBe(true);
    expect(registry.getStats().loadedCount).toBe(1);
    expect(registry.getStats().totalLoaded).toBe(1);
  });

  it('load is idempotent — double-loading does not increment totalLoaded twice', () => {
    const registry = createLibraryRegistry();
    registry.load('/usr/lib/libfoo.so');
    registry.load('/usr/lib/libfoo.so');
    expect(registry.getStats().loadedCount).toBe(1);
    expect(registry.getStats().totalLoaded).toBe(1);
  });

  it('unload removes the library', () => {
    const registry = createLibraryRegistry();
    registry.load('/usr/lib/libfoo.so');
    registry.unload('/usr/lib/libfoo.so');
    expect(registry.isLoaded('/usr/lib/libfoo.so')).toBe(false);
    expect(registry.getStats().loadedCount).toBe(0);
    expect(registry.getStats().totalUnloaded).toBe(1);
  });

  it('unload is idempotent — unloading absent path does not increment totalUnloaded', () => {
    const registry = createLibraryRegistry();
    registry.unload('/nonexistent.so');
    expect(registry.getStats().totalUnloaded).toBe(0);
  });

  it('listLoaded returns all loaded paths', () => {
    const registry = createLibraryRegistry();
    registry.load('/lib/liba.so');
    registry.load('/lib/libb.so');
    registry.load('/lib/libc.so');
    expect(registry.listLoaded().sort()).toEqual(['/lib/liba.so', '/lib/libb.so', '/lib/libc.so']);
  });

  it('listLoaded excludes unloaded entries', () => {
    const registry = createLibraryRegistry();
    registry.load('/lib/liba.so');
    registry.load('/lib/libb.so');
    registry.unload('/lib/liba.so');
    expect(registry.listLoaded()).toEqual(['/lib/libb.so']);
  });

  it('getStats.loadedCount reflects current live count', () => {
    const registry = createLibraryRegistry();
    registry.load('/lib/liba.so');
    registry.load('/lib/libb.so');
    registry.unload('/lib/liba.so');
    expect(registry.getStats().loadedCount).toBe(1);
    expect(registry.getStats().totalLoaded).toBe(2);
    expect(registry.getStats().totalUnloaded).toBe(1);
  });

  it('destroy clears all entries', () => {
    const registry = createLibraryRegistry();
    registry.load('/lib/liba.so');
    registry.load('/lib/libb.so');
    registry.destroy();
    expect(registry.getStats().loadedCount).toBe(0);
    expect(registry.listLoaded()).toEqual([]);
  });
});
