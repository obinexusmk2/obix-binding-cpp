import { afterEach, describe, expect, it } from 'vitest';

import { createCppBinding } from '../src/index';

describe('cpp binding smoke', () => {
  afterEach(() => {
    delete (globalThis as any).__obixAbiInvoker;
  });

  it('toggles initialize/destroy state and uses shared invocation envelope', async () => {
    const ffiPath = '/tmp/obix-cpp-ffi.mock';

    const binding = createCppBinding({
      ffiPath,
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
    });

    expect(binding.isInitialized()).toBe(false);

    const beforeInit = await binding.invoke('ping', [1]);
    expect(beforeInit).toMatchObject({ code: 'NOT_INITIALIZED' });

    await binding.initialize();
    expect(binding.isInitialized()).toBe(true);

    const noSymbol = await binding.invoke('ping', [1]);
    expect(noSymbol).toMatchObject({ code: 'MISSING_SYMBOL' });

    (globalThis as any).__obixAbiInvoker = {
      invoke: (payload: string) => {
        const envelope = JSON.parse(payload);
        return { ok: true, echo: envelope };
      },
    };

    const result = await binding.invoke('ping', [1, 2, 3]);
    expect(result).toMatchObject({
      ok: true,
      echo: {
        functionId: 'ping',
        args: [1, 2, 3],
        metadata: { binding: 'cpp', ffiPath },
      },
    });

    await binding.destroy();
    expect(binding.isInitialized()).toBe(false);
  });

  it('getMemoryUsage returns CppHeapStats shape', () => {
    const binding = createCppBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'monoglot',
      memoryModel: 'manual',
    });

    expect(binding.getMemoryUsage()).toEqual({
      heapBytes: 0,
      peakHeapBytes: 0,
      stackBytes: 0,
      staticBytes: 0,
      allocCount: 0,
      freeCount: 0,
    });
  });

  it('getSchemaMode returns configured mode', () => {
    const binding = createCppBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'polyglot',
      memoryModel: 'manual',
    });

    expect(binding.getSchemaMode()).toBe('polyglot');
  });

  it('sub-module accessors are defined', () => {
    const binding = createCppBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
    });

    expect(binding.ffiTransport).toBeDefined();
    expect(binding.heapTracker).toBeDefined();
    expect(binding.libraryRegistry).toBeDefined();
    expect(binding.schemaResolver).toBeDefined();
  });

  it('loadLibrary before init is a no-op', async () => {
    const binding = createCppBinding({
      ffiPath: '/tmp/test.so',
      schemaMode: 'hybrid',
      memoryModel: 'hybrid',
    });

    await binding.loadLibrary('/usr/lib/libfoo.so');
    expect(binding.libraryRegistry.isLoaded('/usr/lib/libfoo.so')).toBe(false);
  });
});
