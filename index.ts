// Re-export for n8n to autoload
// Re-exports used by n8n when the package is loaded.
// Keep these entry points thin: they simply expose the node and credential
// implementations from the `src/` tree so the TypeScript sources are easy to
// navigate during development. The build step (`tsc -p tsconfig.build.json`)
// emits a `dist/` folder which n8n will consume at runtime.
export * from './src/nodes/IbmIOdbc/IbmIOdbc.node';
export * from './src/credentials/IbmiOdbc.credentials';
