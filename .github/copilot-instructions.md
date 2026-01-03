# Songs of Doom - AI Coding Instructions

## Project Overview

SvelteKit 5 application using TypeScript, building a game trait/property catalog system with multi-language support (Catalan, Spanish, English). Data is stored in YAML files and transformed through a three-layer type system (Record → DTO → App types).

## Architecture

### Catalog System (`src/catalog/`)

The core architecture uses filesystem-based data loading:

- **Data Layer**: YAML files in `src/catalog/data/{catalogName}/**/*.yaml` define game content
- **Loading**: `getCatalog()` uses `fast-glob` to discover and load all YAML files for a catalog type
- **Metadata**: Each loaded record gets a symbol-keyed `[RECORD_METADATA]` property with `id` (filename) and `path` (directory structure)
- **Type Flow**: `Record` types (raw YAML) → `DTO` types (serializable JSON) → App types (with resolved references)

Example: [warrior.yaml](src/catalog/data/traits/warrior/warrior.yaml) loads as `TraitRecord`, transforms to `TraitDTO` in [+page.server.ts](src/routes/traits/+page.server.ts)

Directory structure encodes hierarchy: `traits/warrior/barbarian/barbarian.yaml` has path `['warrior', 'barbarian']`

### Localization Pattern

Multi-language fields use `LocalisedText = Record<'ca' | 'es' | 'en', string>` in YAML:

```yaml
title:
  ca: Guerrer
  es: Guerrero
  en: Warrior
```

Use `requireLocalisedField()` for required fields, `getLocalisedField()` for optional. Both in [src/lib/localisation.ts](src/lib/localisation.ts).

Currently hardcoded to Catalan (`LOCALE = 'ca'`) in server load functions.

### SvelteKit Structure

- **Svelte 5**: Uses runes (`$props`, `$state`) not Svelte 4 syntax
- **Server loads**: Data transformation happens in `+page.server.ts` files - catalogs load here, not client-side
- **Title pattern**: Every route's `load()` returns `{ title }`, used by [+layout.svelte](src/routes/+layout.svelte) via `getDocumentTitle()`
- **Path aliases**: `$lib` = `src/lib`, `$app` for SvelteKit internals

## Development Workflow

```bash
npm run dev              # Start dev server
npm run test             # Run all tests once
npm run test:unit        # Interactive test mode (vitest)
npm run check            # Type-check (svelte-check)
npm run lint             # Prettier + ESLint
```

### Testing Setup

Two test configurations in [vite.config.ts](vite.config.ts):

1. **Client tests** (`*.svelte.{test,spec}.ts`): Use Playwright browser with `vitest-browser-svelte`
   - Import from `vitest/browser` and use `render()` from `vitest-browser-svelte`
   - See [page.svelte.spec.ts](src/routes/page.svelte.spec.ts)
2. **Server tests** (other `.{test,spec}.ts`): Node environment
   - Standard vitest imports
   - See [demo.spec.ts](src/demo.spec.ts)

All tests require assertions (`expect.requireAssertions: true`)

## Project Conventions

- **Import meta.dirname**: Use `import.meta.dirname` (not `__dirname`) for ESM file paths
- **Strict TypeScript**: All strict flags enabled, no implicit any
- **ESLint**: ESM flat config in [eslint.config.js](eslint.config.js)
- **File extensions**: Import Svelte as `.svelte`, TypeScript uses `.ts` (no extensions in imports)
- **JSON Schemas**: Define YAML structure in `src/catalog/schema/*.json`, reference with `$ref`
- **Module resolution**: Uses `bundler` mode for TypeScript

## Key Files

- [src/catalog/index.ts](src/catalog/index.ts): Core catalog loading logic with `getCatalog()` and metadata handling
- [src/lib/localisation.ts](src/lib/localisation.ts): Multi-language utilities
- [src/catalog/types/](src/catalog/types/): Type definitions showing Record/DTO/App type patterns
- [vite.config.ts](vite.config.ts): Dual test project configuration
