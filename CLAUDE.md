# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Songs of Doom is a SvelteKit 5 application using TypeScript for a card-based game system. It uses a catalog architecture where game content (traits, skills, items, creatures) is defined in TypeScript files and loaded dynamically with metadata. The app supports multi-language content (Catalan, Spanish, English).

## Workspace Structure

The project is organized as an npm workspace monorepo with three packages:

```
packages/
├── common/           # @songsofdoom/common - Shared utilities and localization
├── game/             # @songsofdoom/game - Game models and data (TypeScript only)
└── web/              # @songsofdoom/web - The SvelteKit application
```

**Package dependencies:**

- `@songsofdoom/common` has no dependencies (exports localisation and utilities)
- `@songsofdoom/game` depends on `@songsofdoom/common`
- `@songsofdoom/web` depends on both `@songsofdoom/common` and `@songsofdoom/game`

## Development Commands

Commands run from the workspace root:

```bash
npm run dev              # Start dev server with SVG optimization watch
npm run build            # Production build (all packages)
npm run preview          # Preview production build
npm run test             # Run all tests across packages
npm run check            # Type-check all packages
npm run lint             # Run prettier + eslint (web package)
npm run format           # Format code with prettier (web package)
```

### Database Commands

Run from `packages/web/`:

```bash
npx prisma generate      # Generate Prisma client after schema changes
npx prisma db push       # Push schema changes to database
npx prisma studio        # Open Prisma Studio for database management
npx tsx scripts/create-user.ts <username> <password>  # Create admin user
```

## Architecture

### Game Package (`@songsofdoom/game`)

The game package contains all game models and data, loaded dynamically using Vite's `import.meta.glob`:

- **Data files**: Located in `packages/game/src/data/{category}/**/*.ts`
- **Models**: Type definitions in `packages/game/src/models/` define the shape of game entities
- **Metadata**: Each catalog entry gets metadata (id, path, catalog reference) via `getEntryMetadata()`
- **Directory hierarchy**: File paths encode relationships (e.g., `warrior/barbarian/bloodlust.ts` has path `['warrior', 'barbarian']`)
- **Central catalog**: The `entities` catalog in [packages/game/src/catalog.ts](packages/game/src/catalog.ts) combines all archetypes, items, and creatures
- **Exports**: Import game types and data from `@songsofdoom/game`

Example data file structure:

```typescript
// packages/game/src/data/archetypes/warrior/warrior.ts
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

- **Effects** (`packages/game/src/models/effects/`): Actions that happen in the game (attack, defend, change stats, etc.)
  - Each has a corresponding Svelte component with `Chip` suffix in `packages/web/src/lib/components/effects/`
  - The main `EffectChip` component uses type discrimination to render the appropriate specialized component
  - Parameterless effects use singleton instances (e.g., `engage`, `chase`, `negateDamage`) instead of `new EffectClass()`
- **Expressions** (`packages/game/src/models/expressions/`): Boolean (conditions/predicates) and scalar (numeric) values used in game logic
  - All expressions inherit from a common `Expression` base class that provides a `translate()` method for self-localisation
  - Boolean expressions extend `BooleanExpression` (e.g., `engaged`, `Property` instances)
  - Scalar expressions extend `ScalarExpression` (e.g., `distance`, `CountExpression`) and can override `getComparisonShorthand()` for localised comparison text
  - Rendering: `ExpressionChip` checks `translate()` first, then falls back to type-specific rendering for built-in types (numbers, stats, operations, comparisons, logical operators, properties)

When adding new effects or expressions, use the `/add-effect` or `/add-expression` skills.

### Rules Reference System

The rules reference (`/[locale]/rules-reference/`) provides an alphabetical, searchable glossary of game concepts. See the `/update-rules-reference` skill for detailed guidance on creating and updating entries, or use it to understand game concepts and terminology.

### Localization (`@songsofdoom/common/localisation`)

Multi-language content uses `LocalisedText = Partial<Record<'ca' | 'es' | 'en', string>>`:

```typescript
title: {
  ca: 'Guerrer',
  es: 'Guerrero',
  en: 'Warrior'
}
```

Import helper functions from `@songsofdoom/common/localisation`:

- `translate()` for simple text lookup from a `LocalisedText` object
- `requireLocalisedField()` for required fields on an object
- `getLocalisedField()` for optional fields on an object

Locale is selected via an URL component, defaulting to Catalan (`ca`) via a redirection
at the root.

#### Text Component

The [Text](packages/web/src/lib/components/localisation/Text.svelte) component renders localised strings with interpolation support. Use `%(name)` placeholders for dynamic content:

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

Svelte 5 components in `packages/web/` follow these patterns:

- **Naming**: PascalCase with `.svelte` extension
  - `*Chip.svelte` - Display a single unit of information
  - `*List.svelte` - Display collections
  - `*Icon.svelte` - SVG icon wrappers
- **Props**: Define a `Props` interface extending `StandardAttributeProps` from [packages/web/src/lib/components/standardattributes.ts](packages/web/src/lib/components/standardattributes.ts)
- **Styles**: Use SCSS with `@reguitzell/styles` (imported as `rz`)
- **Svelte 5**: Use runes (`$props`, `$state`) not Svelte 4 syntax
- **Path aliases**: `$lib` = `packages/web/src/lib`, `$app` for SvelteKit internals
- **Game imports**: Import from `@songsofdoom/game` for models and data, `@songsofdoom/common/localisation` for localization helpers
- **Documentation**: Use `@component` HTML comments before the script tag for component docs, and JSDoc on Props for prop docs (see [Text.svelte](packages/web/src/lib/components/localisation/Text.svelte) for an example)

Use the `/svelte-component` skill when creating or updating components.

### URL Handling

Internal navigation uses URL handlers from [packages/web/src/lib/urls.ts](packages/web/src/lib/urls.ts). Each handler provides:

- `get(...args)` - Returns the resolved URL string
- `go(...args)` - Navigates to the URL via `goto()`

```typescript
import { entityUrl, characterUrl, newCharacterUrl } from '$lib/urls';

// Get URL for use in href
<a href={entityUrl.get(entity)}>View</a>

// Programmatic navigation
characterUrl.go(character);
```

URL handlers use SvelteKit's `resolve()` with static route patterns (e.g., `'/[locale]/cards/[id]'`) for type-safe path generation and automatic base path handling.

### Testing

Tests use vitest configured in each package's `vite.config.ts`. The game package tests models, while the web package tests application logic. All tests require assertions (`expect.requireAssertions: true`).

### SVG Assets

SVG files in `packages/web/src/lib/assets/svg/` are optimized automatically:

- Pre-build optimization via svgo
- Watch mode during development optimizes on save
- Import as Svelte components via `packages/web/src/lib/assets/svg/index.ts`

### Database & Authentication

The web package uses PostgreSQL with Prisma 7 for data persistence and custom session-based authentication:

- **Database**: PostgreSQL via Prisma with the `@prisma/adapter-pg` driver adapter
- **Schema**: [packages/web/prisma/schema.prisma](packages/web/prisma/schema.prisma) defines `User` and `Session` models
- **Configuration**: [packages/web/prisma.config.ts](packages/web/prisma.config.ts) configures the database URL from environment
- **Environment**: `DATABASE_URL` must be set in `.env` at workspace root (see `.env.example`)

Authentication components:

- **Server utilities**: `packages/web/src/lib/server/` contains `db.ts` (Prisma client), `auth.ts` (session management), and `password.ts` (Argon2id hashing)
- **Session hook**: [packages/web/src/hooks.server.ts](packages/web/src/hooks.server.ts) validates sessions on every request and populates `event.locals.user`
- **Auth routes**: Login at `/[locale]/auth/login`, logout via POST to `/[locale]/auth/logout`
- **UI**: [UserMenu](packages/web/src/lib/components/auth/UserMenu.svelte) component displays login link or username with logout button

User management is admin-only via CLI script—no public signup. After setting up the database, create users with:

```bash
cd packages/web && npx tsx scripts/create-user.ts <username> <password>
```

## Custom Skills

This project includes custom Claude Code skills:

- `/svelte-component` - Create/update Svelte components following project conventions
- `/add-effect` - Add new game effect types (TypeScript class + Svelte component)
- `/add-expression` - Add new expression types (TypeScript class + ExpressionChip integration)
- `/add-property` - Add new property types (Keyword, Rule, ScalarRule) with optional rules reference entry
- `/update-rules-reference` - Create/update rules reference entries; use to understand game concepts
- `/update-instructions` - Update CLAUDE.md and all skill files to reflect the current state of the project

## Post-Implementation Validation

After implementing changes, validate the project by running:

```bash
npm run lint      # Check formatting and lint rules
npm run check     # TypeScript type checking
npm run test      # Run tests
```

If any command fails, fix the errors and re-run validation until all commands pass.

Don't suppress linting errors! If that seems to be the only way of fixing an issue, suggest it to the user, but do NOT do it silently!

## Important Conventions

- **ESM**: Use `import.meta.dirname` not `__dirname`
- **No extensions in imports**: Import TypeScript as `./file` not `./file.ts`
- **Strict TypeScript**: All strict flags enabled, no implicit any
- **Import order**: External deps (including `@songsofdoom/*`), then `$lib` imports, then relative imports
- **Package imports**: Use `@songsofdoom/game` for models/data, `@songsofdoom/common/localisation` for localization, `@songsofdoom/common` for shared utilities
- **File organization**:
  - Game models: `packages/game/src/models/{category}/`
  - Game data: `packages/game/src/data/{category}/`
  - Components: `packages/web/src/lib/components/{category}/`
  - Rules reference: `packages/web/src/lib/rules-reference/entries/{slug}/`
  - Server-only code: `packages/web/src/lib/server/`
- **Formatting**: Run `npm run format` after editing files to ensure consistent formatting via Prettier
