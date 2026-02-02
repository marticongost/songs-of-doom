---
name: update-rules-reference
description: Create or update rules reference entries for game concepts. Use this skill to understand game concepts and terminology.
autoInvoke: false
---

# Update rules reference

## When to use this skill

Use this skill in two scenarios:

1. **When you need to understand game concepts**: If you're unsure about game terminology, mechanics, or concepts (e.g., "What is a capability?", "How do stats work?"), invoke this skill to explore the rules reference and learn about the game system.
2. **When creating or updating rules entries**: When explicitly asked to add a new rules reference entry or update an existing one via `/update-rules-reference`.

## Rules reference overview

The rules reference (`/[locale]/rules-reference/`) is an alphabetical, searchable glossary of game concepts. Each entry explains a single concept and can cross-link to related entries.

**Architecture:**

- **Module**: [src/lib/rules-reference/](src/lib/rules-reference/)
  - [index.ts](src/lib/rules-reference/index.ts) — loads SVX files via `import.meta.glob`, builds the entry index
  - [model-sources.ts](src/lib/rules-reference/model-sources.ts) — maps slugs to existing model instances (Stats, EntityTypes, Focuses, Rules)
  - [types.ts](src/lib/rules-reference/types.ts) — TypeScript types for entries and SVX modules
- **Content**: `src/lib/rules-reference/entries/{slug}/{locale}.svx` — one directory per concept, one `.svx` file per locale (ca, es, en)
- **Components**: `src/lib/components/rules-reference/`
  - `RuleEntry.svelte` — displays a single entry on the rules reference page
  - `RuleLink.svelte` — cross-reference link component (auto-resolves localised titles)
  - `RuleSearch.svelte` — search/filter UI
- **Route**: [src/routes/[locale]/rules-reference/+page.svelte](src/routes/[locale]/rules-reference/+page.svelte)

## Entry types

There are two types of rules reference entries:

### 1. Model-sourced entries

Title comes from an existing model instance's `title` or `name` field. The [model-sources.ts](src/lib/rules-reference/model-sources.ts) module auto-derives these from:

- **Stats** (from `stats` record): `strength`, `agility`, `intelligence`, `charisma`, `will`, `health`, `sanity`
- **Entity types** (from `entityTypes` record): creature types, item types, etc.
- **Focuses** (from `focuses` record, excluding attribute-based duplicates)
- **Rules** (auto-discovered via `import.meta.glob` on `src/lib/catalog/data/properties/*.ts`, filtered by `instanceof Rule`)

For model-sourced entries:

- **Do not** include `title` in SVX front matter (it's auto-resolved from the model)
- Create SVX files at `src/lib/rules-reference/entries/{slug}/{locale}.svx` where `slug` matches the model's key
- The SVX file only contains the body content (explanation, examples, cross-links)

### 2. Ad-hoc entries

Used for game concepts without a dedicated model class (e.g., "capability", "opportunity", "obligation"). These entries require a `title` in the SVX front matter.

For ad-hoc entries:

- **Include** `title` in the front matter for each locale
- Create SVX files at `src/lib/rules-reference/entries/{slug}/{locale}.svx` where `slug` is your chosen URL-friendly identifier

## Creating a new entry

Follow these steps:

### 1. Determine entry type and slug

- If the concept corresponds to an existing model (Stat, EntityType, Focus, Rule), check [model-sources.ts](src/lib/rules-reference/model-sources.ts) to see if it's already mapped. If it is, the entry is model-sourced and you should use that model's key as the slug.
- Otherwise, choose a short, URL-friendly slug (lowercase, hyphens for spaces).

### 2. Create the directory and SVX files

Create `src/lib/rules-reference/entries/{slug}/` with three files:

- `ca.svx` (Catalan)
- `es.svx` (Spanish)
- `en.svx` (English)

### 3. Add front matter and content

**For model-sourced entries:**

```svx
---
---
<script>
  import RuleLink from "$lib/components/rules-reference/RuleLink.svelte"
</script>

[Explanation of the concept in the target language]

[Optional examples, cross-links using RuleLink component or markdown links]
```

**For ad-hoc entries:**

```svx
---
title: [Title in the target language]
---
<script>
  import RuleLink from "$lib/components/rules-reference/RuleLink.svelte"
</script>

[Explanation of the concept in the target language]

[Optional examples, cross-links using RuleLink component or markdown links]
```

### 4. Cross-link related entries

Use the `RuleLink` component for cross-references between entries:

```svelte
See <RuleLink slug="capability" label="Capabilities" /> for details.
<RuleLink slug="stat" transform="lowercase" /> values range from 1 to 5.
```

The `RuleLink` component auto-resolves the localised title from the slug. You can override with `label` or transform with `transform="lowercase"`.

### 5. Verify in browser

Run `npm run dev` and navigate to `/ca/rules-reference` (or `/es/rules-reference`, `/en/rules-reference`) to verify your new entry appears and renders correctly.

## Updating an existing entry

1. Locate the entry directory at `src/lib/rules-reference/entries/{slug}/`
2. Edit the relevant locale file(s) (`ca.svx`, `es.svx`, `en.svx`)
3. If changing a model-sourced entry's title, update the source model instead of the SVX front matter
4. Verify in browser

## Understanding game concepts

If you're unsure about a game concept:

1. **Check the rules reference first**: Read through existing entries in `src/lib/rules-reference/entries/` to understand the game's terminology and mechanics
2. **Check model definitions**: Look at `src/lib/catalog/models/` for type definitions and structure
3. **Check data files**: Look at `src/lib/catalog/data/` for concrete examples of how concepts are used in game content
4. **Ask the user**: If the concept isn't documented yet, ask the user for clarification before proceeding

## SVX syntax and features

SVX files use mdsvex (Markdown + Svelte):

- **Front matter**: YAML between `---` delimiters (optional for model-sourced, required for ad-hoc)
- **Markdown**: Standard markdown syntax for text, lists, links, etc.
- **Svelte components**: Import and use Svelte components like `RuleLink`
- **Script tags**: Use `<script>` (not `<script lang="ts">`) for imports in SVX files
- **Script type scss**: The example shows `<script type="scss">` but it should be just `<script>` for component imports

## Important notes

- **Localisation order**: Always list languages as `ca`, `es`, `en` (Catalan first, English last)
- **No model changes**: This skill only creates/updates SVX content. If you need to add a new model (Stat, Rule, etc.), that's outside the scope of this skill.
- **Slug consistency**: The slug must match exactly between the directory name and any cross-references
- **Cross-linking**: Prefer `RuleLink` component over markdown links for better maintainability and auto-resolution of titles
