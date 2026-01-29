---
name: add-condition
description: Create TypeScript types and Svelte components to represent a condition that must be satisfied in order for a card effect to be triggered.
---

# Add a new condition

## When to use this skill

Use this skill when the user needs to define or modify a type of condition that can
determine whether a given card effect should be triggered.

## Model conventions

- **File name**: kebab-case (e.g. `distance-condition.ts`, `wounded-condition.ts`), placed in `src/lib/catalog/models/conditions/`
- **Props interface**: named `{ClassName}Props` — standalone, does **not** extend any base interface
- **Class**: extends `Condition` (imported from `./condition`). The base class is non-abstract and provides a `then(...effects)` convenience method
- **Fields**: all `readonly`, assigned in the constructor
- **Constructor**: takes a single destructured props object, calls `super()` first
- **JSDoc**: add doc comments to the interface, the class, and every field

### Example model file

```typescript
import { Condition } from './condition';

/**
 * Props for configuring a DistanceCondition.
 */
export interface DistanceConditionProps {
	/** The maximum number of steps away the target can be. */
	steps: number;
}

/**
 * A condition that checks whether the target is within a certain distance.
 */
export class DistanceCondition extends Condition {
	/** The maximum number of steps away the target can be. */
	readonly steps: number;

	constructor({ steps }: DistanceConditionProps) {
		super();
		this.steps = steps;
	}
}
```

If a field requires transformation (e.g. resolving an expression), perform the conversion inside the constructor so the readonly field stores the resolved value.

## Component conventions

- **File name**: PascalCase with `ConditionChip` suffix (e.g. `DistanceConditionChip.svelte`), placed in `src/lib/components/conditions/`
- **Props**: interface with a single `condition` prop typed to the concrete condition class (does **not** extend `StandardAttributeProps`)
- **Localisation**: use the `<Text>` component with `ca`, `es`, and `en` props for all user-visible strings; use `%(name)` placeholders for interpolated values

### Example chip component

```svelte
<script lang="ts">
	import { DistanceCondition } from '$lib/catalog/models/conditions';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		condition: DistanceCondition;
	}

	const { condition }: Props = $props();
</script>

<Text
	ca="A %(steps) passos o menys"
	es="A %(steps) pasos o menos"
	en="At %(steps) steps or less"
	steps={condition.steps}
/>
```

## Tasks

1. **Create the model file** in `src/lib/catalog/models/conditions/`, exporting:
   - A `{ClassName}Props` interface with the properties described by the user
   - A class extending `Condition` with readonly fields, a destructured constructor, and JSDoc
2. **Barrel-export** the new class (and any companion types) from `src/lib/catalog/models/conditions/index.ts`
3. **Create the chip component** `{ClassName}ConditionChip.svelte` in `src/lib/components/conditions/`:
   - Accept a `condition` prop typed to the new class
   - Render localised text using `<Text>` with `ca`/`es`/`en` props
4. **Update the dispatcher** in `src/lib/components/conditions/ConditionChip.svelte`:
   - Import the new condition class and chip component
   - Add an `{:else if condition instanceof NewCondition}` branch rendering the new chip

Make sure to use the /svelte-component skill to follow project conventions when creating
or updating Svelte files.
