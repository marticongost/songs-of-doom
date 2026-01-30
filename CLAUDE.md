# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Songs of Doom is a SvelteKit 5 application using TypeScript for a card-based game system. It uses a catalog architecture where game content (traits, skills, items, creatures) is defined in TypeScript files and loaded dynamically with metadata. The app supports multi-language content (Catalan, Spanish, English).

## Development Commands

```bash
npm run dev              # Start dev server with SVG optimization watch
npm run build            # Production build (runs svgo prebuild automatically)
npm run preview          # Preview production build
npm run test             # Run all tests once
npm run test:unit        # Interactive test mode (vitest watch)
npm run check            # Type-check with svelte-check
npm run check:watch      # Type-check in watch mode
npm run lint             # Run prettier + eslint
npm run format           # Format code with prettier
```

## Architecture

### Catalog System

The catalog system loads game entities from TypeScript files using Vite's `import.meta.glob`:

- **Data files**: Located in `src/lib/catalog/data/{category}/**/*.ts`
- **Models**: Type definitions in `src/lib/catalog/models/` define the shape of game entities
- **Metadata**: Each catalog entry gets metadata (id, path, catalog reference) via `getEntryMetadata()`
- **Directory hierarchy**: File paths encode relationships (e.g., `warrior/barbarian/bloodlust.ts` has path `['warrior', 'barbarian']`)
- **Central catalog**: The `entities` catalog in [src/lib/catalog/index.ts](src/lib/catalog/index.ts) combines all archetypes, items, and creatures

Example data file structure:

```typescript
// src/lib/catalog/data/archetypes/warrior/warrior.ts
export default new Trait({
	title: { ca: 'Guerrer', es: 'Guerrero', en: 'Warrior' },
	xpCost: 5,
	capabilities: [
		/* ... */
	]
});
```

### Effect and Expression System

Game effects and expressions follow a class-based polymorphic pattern:

- **Effects** (`src/lib/catalog/models/effects/`): Actions that happen in the game (attack, defend, change stats, etc.)
  - Each has a corresponding Svelte component with `Chip` suffix in `src/lib/components/effects/`
  - The main `EffectChip` component uses type discrimination to render the appropriate specialized component
- **Expressions** (`src/lib/catalog/models/expressions/`): Boolean (conditions/predicates) and scalar (numeric) values used in game logic
  - Boolean expressions extend `BooleanExpression` (e.g., `engaged`, `PropertyExpression`)
  - Scalar expressions extend `ScalarExpression` (e.g., `distance`, `NearbyEnemiesExpression`)
  - All expressions are rendered through a single `ExpressionChip` component that handles type discrimination

When adding new effects or expressions, use the `/add-effect` or `/add-expression` skills.

### Localization

Multi-language content uses `LocalisedText = Record<'ca' | 'es' | 'en', string>`:

```typescript
title: {
  ca: 'Guerrer',
  es: 'Guerrero',
  en: 'Warrior'
}
```

Use helper functions from [src/lib/localisation.ts](src/lib/localisation.ts):

- `requireLocalisedField()` for required fields
- `getLocalisedField()` for optional fields

Locale is selected via an URL component, defaulting to Catalan (`ca`) via a redirection
at the root.

#### Text Component

The [Text](src/lib/components/localisation/Text.svelte) component renders localised strings with interpolation support. Use `%(name)` placeholders for dynamic content:

```svelte
<!-- Simple text -->
<Text ca="Hola món" es="Hola mundo" en="Hello world" />

<!-- Value interpolation (primitives) -->
<Text
	ca="La resposta és %(answer)"
	es="La respuesta es %(answer)"
	en="The answer is %(answer)"
	answer={42}
/>

<!-- Snippet interpolation (components, HTML) -->
<Text ca="Hola %(user)" es="Hola %(user)" en="Hello %(user)">
	{#snippet user()}
		<strong>{userName}</strong>
	{/snippet}
</Text>
```

- Use **props** for simple values (strings, numbers)
- Use **snippets** for complex content (components, styled HTML)
- Missing placeholders throw an error at render time

### Component Conventions

Svelte 5 components follow these patterns:

- **Naming**: PascalCase with `.svelte` extension
  - `*Chip.svelte` - Display a single unit of information
  - `*List.svelte` - Display collections
  - `*Icon.svelte` - SVG icon wrappers
- **Props**: Define a `Props` interface extending `StandardAttributeProps` from [src/lib/components/standardattributes.ts](src/lib/components/standardattributes.ts)
- **Styles**: Use SCSS with `@reguitzell/styles` (imported as `rz`)
- **Svelte 5**: Use runes (`$props`, `$state`) not Svelte 4 syntax
- **Path aliases**: `$lib` = `src/lib`, `$app` for SvelteKit internals
- **Documentation**: Use `@component` HTML comments before the script tag for component docs, and JSDoc on Props for prop docs (see [Text.svelte](src/lib/components/localisation/Text.svelte) for an example)

Use the `/svelte-component` skill when creating or updating components.

### Testing

Two test configurations in [vite.config.ts](vite.config.ts):

1. **Client tests** (`*.svelte.{test,spec}.ts`): Run in Playwright browser
   - Import from `vitest/browser`
   - Use `render()` from `vitest-browser-svelte`

2. **Server tests** (other `.{test,spec}.ts`): Run in Node environment
   - Standard vitest imports

All tests require assertions (`expect.requireAssertions: true`).

### SVG Assets

SVG files in `src/lib/assets/svg/` are optimized automatically:

- Pre-build optimization via svgo
- Watch mode during development optimizes on save
- Import as Svelte components via `src/lib/assets/svg/index.ts`

## Custom Skills

This project includes custom Claude Code skills:

- `/svelte-component` - Create/update Svelte components following project conventions
- `/add-effect` - Add new game effect types (TypeScript class + Svelte component)
- `/add-expression` - Add new expression types (TypeScript class + ExpressionChip integration)

## Important Conventions

- **ESM**: Use `import.meta.dirname` not `__dirname`
- **No extensions in imports**: Import TypeScript as `./file` not `./file.ts`
- **Strict TypeScript**: All strict flags enabled, no implicit any
- **Import order**: External deps, then $lib imports, then relative imports
- **File organization**: Components in `src/lib/components/{category}/`, models in `src/lib/catalog/models/{category}/`
