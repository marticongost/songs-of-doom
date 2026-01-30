---
name: add-effect
description: Create TypeScript types and Svelte components to represent one of the possible effects from a card in the game.
---

# Add a new effect

## When to use this skill

Use this skill when the user needs to add a new type of effect that can be added to one of the cards of the game.

## Model conventions

- **File name**: lowercase, no hyphens (e.g. `drawcards.ts`, `modifydamage.ts`), placed in `src/lib/catalog/models/effects/`
- **Props interface**: named `{ClassName}Props` — standalone, does **not** extend any base interface
- **Class**: extends `Effect` (imported from `./effect`)
- **Fields**: all `readonly`, assigned in the constructor
- **Constructor**: takes a single destructured props object, calls `super()` first
- **JSDoc**: add doc comments to the interface, the class, and every field

### Example model file

```typescript
import { Effect } from './effect';

/**
 * Props for configuring a ModifyDamageEffect.
 */
export interface ModifyDamageEffectProps {
	/** The amount to modify the damage by. Positive values increase, negative values decrease. */
	amount: number;
}

/**
 * An effect that modifies the damage dealt by an attack.
 */
export class ModifyDamageEffect extends Effect {
	/** The amount to modify the damage by. Positive values increase, negative values decrease. */
	readonly amount: number;

	constructor({ amount }: ModifyDamageEffectProps) {
		super();
		this.amount = amount;
	}
}
```

If a field requires transformation (e.g. resolving an expression), perform the conversion inside the constructor so the readonly field stores the resolved value.

## Component conventions

- **File name**: PascalCase with `EffectChip` suffix (e.g. `ModifyDamageEffectChip.svelte`), placed in `src/lib/components/effects/`
- **Props**: interface with a single `effect` prop typed to the concrete effect class
- **Localisation**: use the `<Text>` component with `ca`, `es`, and `en` props for all user-visible strings; use `%(name)` placeholders for interpolated values

### Example chip component

```svelte
<script lang="ts">
	import { DrawCardsEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: DrawCardsEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Robar %(amount) cartes"
	es="Robar %(amount) cartas"
	en="Draw %(amount) cards"
	amount={effect.amount}
/>
```

## Tasks

1. **Create the model file** in `src/lib/catalog/models/effects/`, exporting:
   - A `{ClassName}Props` interface with the properties described by the user
   - A class extending `Effect` with readonly fields, a destructured constructor, and JSDoc
2. **Barrel-export** the new class (and any companion types) from `src/lib/catalog/models/effects/index.ts`
3. **Create the chip component** `{ClassName}EffectChip.svelte` in `src/lib/components/effects/`:
   - Accept an `effect` prop typed to the new class
   - Render localised text using `<Text>` with `ca`/`es`/`en` props
4. **Update the dispatcher** in `src/lib/components/effects/EffectChip.svelte`:
   - Import the new effect class and chip component
   - Add an `{:else if effect instanceof NewEffect}` branch rendering the new chip

Make sure to use the /svelte-component skill to follow project conventions when creating
or updating Svelte files.

After completing all changes, run `npm run format` to ensure consistent formatting via Prettier.
