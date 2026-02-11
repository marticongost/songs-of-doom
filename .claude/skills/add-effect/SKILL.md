---
name: add-effect
description: Create TypeScript types and Svelte components to represent one of the possible effects from a card in the game.
---

# Add a new effect

## When to use this skill

Use this skill when the user needs to add a new type of effect that can be added to one of the cards of the game.

## Model conventions

There are two patterns for effect classes depending on whether the effect requires configuration:

### Effects with parameters

For effects that require configuration (e.g. amount of damage, target, etc.):

- **File name**: lowercase, no hyphens (e.g. `drawcards.ts`, `modifydamage.ts`), placed in `src/lib/catalog/models/effects/`
- **Props interface**: named `{ClassName}Props` — standalone, does **not** extend any base interface
- **Class**: extends `Effect` (imported from `./effect`)
- **Fields**: all `readonly`, assigned in the constructor
- **Constructor**: takes a single destructured props object, calls `super()` first
- **JSDoc**: add doc comments to the interface, the class, and every field

#### Example: effect with parameters

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

### Parameterless effects (singletons)

For effects that require no configuration, use a simpler pattern with a singleton instance:

- **Class**: extends `Effect` with no constructor, no props interface, no fields
- **Singleton**: export a `const` instance with a descriptive camelCase name
- **JSDoc**: add doc comments to both the class and the singleton

#### Example: parameterless effect with singleton

```typescript
import { Effect } from './effect';

/**
 * An effect that allows the player to engage an opponent, pulling them
 * into melee range within the player's threat zone.
 */
export class EngageEffect extends Effect {}

/**
 * Singleton instance for engaging an opponent.
 */
export const engage = new EngageEffect();
```

Usage in data files:

```typescript
// Use the singleton directly instead of instantiating
import { engage } from '$lib/catalog/models/effects';

effects: [engage]; // NOT: effects: [new EngageEffect()]
```

Existing singletons: `chase`, `discard`, `engage`, `equip`, `negateDamage`, `redrawFate`, `repeatCapability`, `replaceEncounter`, `resolveEncounter`

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

Follow the process below exactly. Do NOT inspect the codebase for other examples unless
specifically instructed to do so.

1. **Create the model file** in `src/lib/catalog/models/effects/`:
   - **If the effect has parameters**: export a `{ClassName}Props` interface and a class with readonly fields, a destructured constructor, and JSDoc
   - **If the effect has no parameters**: export only the class (no constructor needed) and a singleton instance with a descriptive camelCase name
2. **Barrel-export** from `src/lib/catalog/models/effects/index.ts`:
   - Export the class (always)
   - Export the singleton instance (for parameterless effects)
3. **Create the chip component** `{ClassName}EffectChip.svelte` in `src/lib/components/effects/`:
   - Accept an `effect` prop typed to the new class
   - Render localised text using `<Text>` with `ca`/`es`/`en` props
4. **Update the dispatcher** in `src/lib/components/effects/EffectChip.svelte`:
   - Import the new effect class and chip component
   - Add an `{:else if effect instanceof NewEffect}` branch rendering the new chip

Make sure to use the /svelte-component skill to follow project conventions when creating
or updating Svelte files.

After completing all changes, run `npm run format` to ensure consistent formatting via Prettier.
