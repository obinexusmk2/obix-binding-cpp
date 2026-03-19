const VALID_MODES = ['monoglot', 'polyglot', 'hybrid'];
export function createSchemaResolver(config) {
    const mode = config.schemaMode;
    return {
        resolve() {
            return {
                mode,
                cppStandard: config.cppStandard ?? 'unknown',
                supportsMultiLanguage: mode !== 'monoglot',
                swigEnabled: mode === 'polyglot' || mode === 'hybrid',
                exceptionHandlingEnabled: true,
                rttEnabled: mode !== 'monoglot',
            };
        },
        validate(m) {
            return VALID_MODES.includes(m);
        },
        getMode() {
            return mode;
        },
        destroy() {
            // Stateless
        },
    };
}
//# sourceMappingURL=schema-resolver.js.map