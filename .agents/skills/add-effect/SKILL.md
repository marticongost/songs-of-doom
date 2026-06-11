---
name: add-effect
description: Create TypeScript types and Svelte components to represent one of the possible effects from a card in the game.
---

# Add a new effect

## When to use this skill

Use this skill when the user needs to add a new type of effect that can be added to one of the cards of the game.

## Model conventions

Effect models are in the `@songsofdoom/game` package. There are two patterns depending on whether the effect requires configuration:

### Effects with parameters

For effects that require configuration (e.g. amount of damage, target, etc.):

- **File name**: lowercase, no hyphens (e.g. `drawcards.ts`, `modifydamage.ts`), placed in `packages/game/src/models/effects/`
- **Props interface**: named `{ClassName}Props` — standalone, does **not** extend any base interface
- **Class**: extends `Effect` (imported from `./effect`)
- **Fields**: all `readonly`, assigned in the constructor
- **Constructor**: takes a single destructured props object, calls `super()` first
- **JSDoc**: add doc comments to the interface, the class, and every field

Every effect exports a **factory function** alongside the class. Use factory functions everywhere — never instantiate effects with `new` directly in data files.

#### Example: effect with a single required property

For effects with a single required property, the factory accepts the value directly (shorthand) or the full props object:

```typescript
import { ScalarExpression } from '../expressions';
import type { ScalarExpressionType } from '../expressions';
import { Effect } from './effect';

export interface ModifyDamageEffectProps {
	/** The amount to modify the damage by. Positive values increase, negative values decrease. */
	amount: ScalarExpressionType;
}

export class ModifyDamageEffect extends Effect {
	/** The amount to modify the damage by. Positive values increase, negative values decrease. */
	readonly amount: ScalarExpressionType;

	constructor({ amount }: ModifyDamageEffectProps) {
		super();
		this.amount = amount;
	}
}

const isScalar = (v: ScalarExpressionType | ModifyDamageEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a modify damage effect. */
export const modifyDamage = (
	amountOrProps: ScalarExpressionType | ModifyDamageEffectProps
): ModifyDamageEffect =>
	new ModifyDamageEffect(isScalar(amountOrProps) ? { amount: amountOrProps } : amountOrProps);
```

Usage:

```typescript
modifyDamage(1); // shorthand
modifyDamage(someExpr); // shorthand with expression
```

If the single required property is a plain `number`, omit the `isScalar` helper and check `typeof v === 'number'` directly.

If the single required property is an array (e.g. `talents: Talent[]`), use `Array.isArray()`:

```typescript
export const talent = (talentsOrProps: Talent[] | TalentEffectProps): TalentEffect =>
	new TalentEffect(Array.isArray(talentsOrProps) ? { talents: talentsOrProps } : talentsOrProps);
```

#### Example: effect with multiple properties (plain factory)

When an effect has multiple required properties or no obvious shorthand, export a simple factory:

```typescript
export const attack = (props: FightEffectProps): AttackEffect => new AttackEffect(props);
```

#### Example: parameterless effect

For effects that require no configuration:

```typescript
import { Effect } from './effect';

/**
 * An effect that allows the player to engage an opponent, pulling them
 * into melee range within the player's threat zone.
 */
export class EngageEffect extends Effect {}

/**
 * Creates an effect that engages an opponent.
 */
export const engage = (): EngageEffect => new EngageEffect();
```

Usage in data files:

```typescript
import { engage } from '@songsofdoom/game';

effects: [engage()]; // NOT: effects: [new EngageEffect()] or effects: [engage]
```

If a field requires transformation (e.g. resolving a Target or CapabilityCost), perform the conversion inside the constructor so the readonly field stores the resolved value.

## Engine procedure

Effect execution is handled by the **engine** (`@songsofdoom/engine`), not by an `apply()` method on the model. Each effect needs a **procedure definition** that describes the sequence of steps the engine executes.

The effect model class must **NOT** implement `apply()`. Instead, create an engine procedure that the engine will look up by convention: the procedure ID is derived from the effect's class name via `getEffectProcedureId()` (e.g. `ConditionalEffect` → `ProcedureId.ConditionalEffect`).

### Procedure files

- **File name**: `{lowercase}proc.ts` (e.g. `conditionalproc.ts`, `attachproc.ts`), placed in `packages/engine/src/procedures/effects/`
- **Test file**: `{lowercase}proc.test.ts`, co-located with the procedure file
- **State interface**: exported, named `{EffectName}State` (e.g. `ConditionalEffectState`), extends `EffectProcedureState<TheEffect>` (imported from `../core/triggereffect`)
- **Procedure**: exported as a `const` with camelCase name (e.g. `conditionalEffectProc`)

### The `instructions` API

Use `instructions<StateType>()` to get a pre-bound set of factory functions. Import from `../../core/instructions`:

```typescript
import { instructions } from '../../core/instructions';
import type { EffectProcedureState } from '../core/triggereffect';

interface MyEffectState extends EffectProcedureState<MyEffect> {
	/* extra fields */
}

const { define, forEach, call, triggerEffect, requireSingleTarget, emitEvent } =
	instructions<MyEffectState>();
```

Available instruction helpers (all return a `Step` instance):

| Helper                                           | Purpose                                                                                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `define({ id, steps })`                          | Create a `ProcedureDefinition`. The `id` comes from `ProcedureId`.                                                                                                  |
| `forEach({ name, items, steps, where?, then? })` | Iterate over a list of items. Sets `state[name]` to the current item each iteration. `items` is a function `(state) => items[]`. `steps` is a record of body steps. |
| `call(procedure, parameters?, then?)`            | Call a child procedure. Can pass static parameters or a function `(state) => params`. `then` receives `(state, childResult)` and returns the new state.             |
| `triggerEffect({ effect, parameters?, then? })`  | Trigger the child procedure for an effect. `effect` can be a static value or `(state) => effect`.                                                                   |
| `requireSingleTarget(target, fieldName)`         | Resolves a target to a single entity ID. Stores the result in `state[fieldName]`. `target` can be a static `Target`, a `TargetSpec`, or `(state) => target`.        |
| `emitEvent({ eventType, eventContext? })`        | Emit a game event other cards may react to.                                                                                                                         |
| `mutateGameState((state, game) => { ... })`      | Mutate the game state in place. Convenience wrapper that auto-returns the updated state. The `game` parameter is a `MutableGameState`.                              |
| `input({ fields, then? })`                       | Request input from the player. `fields` can be a static array or `(state) => fields[]`. `then` receives `(state, inputs)`.                                          |

Beyond the instruction helpers, a step can also be a **plain function** `(state: S) => S` — the engine wraps it in a `ComputeStep` automatically. Use these for complex state transformations that go beyond simple mutation:

```typescript
steps: {
    complexTransform(state) {
        const mutatedGameState = state.game.mutate((game) => {
            // Modify game state here
            const target = game.requireEntityState(state.targetId);
            target.someField = newValue;
        });
        return { ...state, game: mutatedGameState, customField: computedValue };
    }
}
```

For simple game state mutations, prefer the `mutateGameState` helper instead.

### Procedure creation checklist

1. **Add a `ProcedureId` entry** in `packages/engine/src/core/procedureid.ts`:

   ```typescript
   export enum ProcedureId {
   	// Effects
   	MyEffect = 'MyEffect'
   }
   ```

   The string value **must match the effect class name** exactly so `getEffectProcedureId()` can resolve it.

2. **Create the procedure file** in `packages/engine/src/procedures/effects/{lowercase}proc.ts`:

   ```typescript
   import type { MyEffect } from '@songsofdoom/game';
   import { instructions } from '../../core/instructions';
   import { ProcedureId } from '../../core/procedureid';
   import type { EffectProcedureState } from '../core/triggereffect';

   export interface MyEffectState extends EffectProcedureState<MyEffect> {
   	// Additional runtime fields for this procedure
   }

   const { define /* other helpers */ } = instructions<MyEffectState>();

   export const myEffectProc = define({
   	id: ProcedureId.MyEffect,
   	steps: {
   		// Define steps using instruction helpers or plain functions
   	}
   });
   ```

3. **Register the procedure** in `packages/engine/src/core/procedureregistry.ts`:
   - Import the procedure at the top
   - Add an entry in the `procedureDefinitions` record under the `// Effects` section

4. **Write tests** in `packages/engine/src/procedures/effects/{lowercase}proc.test.ts`:
   - Use `mock<T>()` from `@songsofdoom/common/test-utils` for dependencies
   - Write a `makeState(effect, game)` helper for concise test setup
   - Test each step's logic in isolation by accessing it directly (e.g. `myEffectProc.steps.stepName.items(state)`)
   - Coerce step types with `as ForEachStep<...>`, `as CallStep<...>`, etc. when testing specific step logic

### Common procedure patterns

**Pattern: forEach + triggerEffect** — for effects that iterate over a list and trigger child effects:

```typescript
export interface MyEffectState extends EffectProcedureState<MyEffect> {
	currentEffect?: Effect;
}

const { define, forEach, triggerEffect } = instructions<MyEffectState>();

export const myEffectProc = define({
	id: ProcedureId.MyEffect,
	steps: {
		triggerAll: forEach({
			name: 'currentEffect',
			items: (state) => state.effect.effects,
			steps: {
				trigger: triggerEffect({ effect: (state) => state.currentEffect! })
			}
		})
	}
});
```

**Pattern: requireSingleTarget + mutateGameState** — for effects that select a target then modify state:

```typescript
export interface MyEffectState extends EffectProcedureState<MyEffect> {
	targetId: EntityId;
}

const { define, requireSingleTarget, mutateGameState } = instructions<MyEffectState>();

export const myEffectProc = define({
	id: ProcedureId.MyEffect,
	steps: {
		selectTarget: requireSingleTarget(({ effect }) => effect.target || 'active-player', 'targetId'),
		apply: mutateGameState((state, game) => {
			const target = game.requireEntityState(state.targetId);
			// modify target
		})
	}
});
```

**Pattern: forEach with conditional items** — for effects that compute items dynamically (e.g. evaluating conditions):

```typescript
export const myEffectProc = define({
	id: ProcedureId.MyEffect,
	steps: {
		triggerEffects: forEach({
			name: 'currentEffect',
			items: (state) => {
				for (const c of state.effect.cases) {
					if (state.game.evaluateBoolean(c.condition)) {
						return c.effects;
					}
				}
				return state.effect.default ?? [];
			},
			steps: {
				triggerEffect: triggerEffect({ effect: (state) => state.currentEffect! })
			}
		})
	}
});
```

### Design guidelines

- **Do NOT implement `apply()`** on the effect model — the engine procedure handles all execution logic.
- **Keep procedures focused** — call child procedures (via `call` or `triggerEffect`) for reusable sub-sequences.
- **Use `state.game`** for reading and mutating the game state. The `game` object on the procedure state provides `mutate()`, `evaluateBoolean()`, and other state accessors.
- **Declare extra state fields** in the state interface when steps need to pass data between each other (e.g. `targetId`, `currentEffect`, `attachmentId`).
- **Follow the naming conventions**: procedure file `{lowercase}proc.ts`, state interface `{PascalCase}State`, procedure const `{camelCase}Proc`.
- **Write tests** for every procedure — test each step's items, parameters, and logic functions in isolation.

## Component conventions

Chip components are in the `@songsofdoom/web` package:

- **File name**: PascalCase with `EffectChip` suffix (e.g. `ModifyDamageEffectChip.svelte`), placed in `packages/web/src/lib/components/effects/`
- **Props**: interface with a single `effect` prop typed to the concrete effect class
- **Imports**: Import effect classes from `@songsofdoom/game`
- **Localisation**: use the `<Text>` component with `ca`, `es`, and `en` props for all user-visible strings; use `%(name)` placeholders for interpolated values

### Example chip component

```svelte
<script lang="ts">
	import { DrawCardsEffect } from '@songsofdoom/game';
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

1. **Create the model file** in `packages/game/src/models/effects/`:
   - Export a `{ClassName}Props` interface (for effects with parameters)
   - Export the class with readonly fields, a destructured constructor, and JSDoc
   - Export a factory function (camelCase, e.g. `modifyDamage`) — use shorthand support for single-required-property effects
2. **Barrel-export** from `packages/game/src/models/effects/index.ts`:
   - Export both the factory function and the class
3. **Add a `ProcedureId` entry** in `packages/engine/src/core/procedureid.ts`:
   - Add a new enum member under the `// Effects` section whose string value matches the effect class name exactly
4. **Create the engine procedure** in `packages/engine/src/procedures/effects/{lowercase}proc.ts`:
   - Define a state interface extending `EffectProcedureState<TheEffect>` (imported from `../core/triggereffect`)
   - Use `instructions<StateType>()` (imported from `../../core/instructions`) to get pre-bound factory helpers
   - Export a procedure using `define()`, referencing the new `ProcedureId`
   - Choose the appropriate instruction helpers (`forEach`, `call`, `triggerEffect`, `requireSingleTarget`, `emitEvent`) or plain function steps for state mutations
5. **Register the procedure** in `packages/engine/src/core/procedureregistry.ts`:
   - Import the procedure at the top
   - Add an entry in the `procedureDefinitions` record under the `// Effects` section
6. **Write tests** in `packages/engine/src/procedures/effects/{lowercase}proc.test.ts`:
   - Use `mock<T>()` from `@songsofdoom/common/test-utils` for dependencies
   - Write a `makeState(effect, game)` helper for concise test setup
   - Test each step's logic in isolation (e.g. `forEachStep.items(state)`, `callStep.parameters(state)`)
   - Coerce step types with `as ForEachStep<...>`, `as CallStep<...>`, etc. when needed
7. **Create the chip component** `{ClassName}EffectChip.svelte` in `packages/web/src/lib/components/effects/`:
   - Accept an `effect` prop typed to the new class (import from `@songsofdoom/game`)
   - Render localised text using `<Text>` with `ca`/`es`/`en` props
8. **Update the dispatcher** in `packages/web/src/lib/components/effects/EffectChip.svelte`:
   - Import the new effect class from `@songsofdoom/game` and the chip component
   - Add an `{:else if effect instanceof NewEffect}` branch rendering the new chip

Make sure to use the `/svelte-component` skill to follow project conventions when creating
or updating Svelte files. Use the `/unit-tests` skill for test-writing conventions.

After completing all changes, run `npm run format` to ensure consistent formatting via Prettier.
