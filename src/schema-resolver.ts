import type {
  CppResolvedSchema,
  CppSchemaResolverAPI,
  CppSchemaResolverConfig,
  SchemaMode,
} from './types.js';

const VALID_MODES: readonly SchemaMode[] = ['monoglot', 'polyglot', 'hybrid'];

export function createSchemaResolver(config: CppSchemaResolverConfig): CppSchemaResolverAPI {
  const mode = config.schemaMode;

  return {
    resolve(): CppResolvedSchema {
      return {
        mode,
        cppStandard: config.cppStandard ?? 'unknown',
        supportsMultiLanguage: mode !== 'monoglot',
        swigEnabled: mode === 'polyglot' || mode === 'hybrid',
        exceptionHandlingEnabled: true,
        rttEnabled: mode !== 'monoglot',
      };
    },

    validate(m: SchemaMode): boolean {
      return (VALID_MODES as readonly string[]).includes(m);
    },

    getMode(): SchemaMode {
      return mode;
    },

    destroy(): void {
      // Stateless
    },
  };
}
