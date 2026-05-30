---
name: create-svelte-component
description: Create or update Svelte components following the project's conventions.
---

# Svelte components

This skill describes conventions used when declaring new Svelte components or modifying
existing ones.

## Component name

If the user has not provide a name for the component explicitly, choose a suitable one
based on the general description of what the component is meant to do. If neither was
provided, ask for clarification.

Conventions:

- Use names in PascalCase with a .svelte extension
- Lists of items should have a `List` suffix (e.g. GizmoList)
- Displays for a single unit of information (e.g. a value or entity) are frequently
  suffixed as `Chip` (e.g. GizmoChip)

## Location

Place components in `packages/web/src/lib/components` by default. The user may request a subfolder, to
group related components together (e.g. `packages/web/src/lib/components/gizmo/GizmoList.svelte`,
`packages/web/src/lib/components/gizmo/GizmoChip.svelte`).

## Svelte version

Use Svelte 5, including runes and snippets. Refrain from using deprecated features from
older versions.

## Tag

Unless otherwise specified, default to `<div>` as the root tag.

## Properties

By convention, declare a `Props` interface with the properties supported by the
component. Make it extend from `StandardAttributeProps` and use it in conjunction with
the `standardAttributes` function to allow the component's standard HTML attributes to
be extended (e.g. add additional CSS classes, set data-_ or aria-_ attributes, etc).

## Styles

Use Emotion CSS-in-JS for all styles. **Do not use `<style>` tags, SCSS, or `@reguitzell/styles`.**

Import the style helpers as `* as css from '$lib/styles'` in the **module script block**,
then define class names with `css.styles({...})` (returns a `Record<string, string>`):

```svelte
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		root: {
			...css.row('sm'),
			...css.hpadding('md'),
			color: css.palette.buccaneer
		}
	});
</script>
```

Apply the generated class name via `standardAttributes`:

```svelte
<div {...standardAttributes(attributes, styles.root)}></div>
```

Available helpers (all imported via `* as css from '$lib/styles'`):

- **Layout**: `css.row(gap?)`, `css.column(gap?)`, `css.grid(gap?)` — return `CSSObject`
- **Spacing**: `css.hpadding(value)`, `css.vpadding(value)`, `css.hmargin(value)`, `css.vmargin(value)` — return `CSSObject`; spread with `...`
- **Spacing tokens** (`xs` | `sm` | `md` | `lg` | `xl`): `css.spacing.sm` etc. for raw values; `css.getSpacing(spec)` to resolve a token or pass through a literal
- **Palette**: `css.palette.*` — named colour values (e.g. `css.palette.buccaneer`)
- **Fonts**: `css.fonts.text`, `css.fonts.heading`, `css.fonts.number`
- **Focus**: `css.focus.outline` — standard focus ring
- **Merging**: `css.mergeRules(...rules)` — deep-merges multiple `CSSObject` values

Nest selectors with `&` just like SCSS (Emotion supports it):

```typescript
const styles = css.styles({
	chip: {
		...css.row('xs'),
		'&:hover': { color: css.palette.red }
	}
});
```

## Imports

Use absolute imports:

- Use `$lib` alias for imports within the web package (e.g., `$lib/components/...`)
- Import game models and data from `@songsofdoom/game`
- Import localization helpers from `@songsofdoom/common/localisation`

## Template

When creating a new component, use the provided `NewComponentTemplate.svelte` template
file.

## Formatting

After creating or modifying components, run `npm run format` to ensure consistent formatting via Prettier.
