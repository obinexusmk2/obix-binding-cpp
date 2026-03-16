# @obinexusltd/obix-binding-cpp

TypeScript bindings for integrating C++ runtimes with the OBIX/libpolycall ABI bridge.

## Features

- Create and manage a C++ binding lifecycle (`initialize`, `invoke`, `destroy`)
- Structured invocation envelope metadata for ABI calls
- Basic error objects for uninitialized bindings, missing symbols, and invocation failures
- Stubs for shared library load/unload operations

## Installation

```bash
npm install @obinexusltd/obix-binding-cpp
```

## Quick start

```ts
import { createCppBinding } from '@obinexusltd/obix-binding-cpp';

const binding = createCppBinding({
  ffiPath: '/opt/lib/libpolycall.so',
  schemaMode: 'polyglot',
  memoryModel: 'hybrid',
  cppStandard: 'c++20',
  compiler: 'clang',
});

await binding.initialize();

const result = await binding.invoke('add_numbers', [1, 2]);
console.log(result);

await binding.destroy();
```

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
