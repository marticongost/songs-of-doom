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

### Implementing apply()

Every concrete `Effect` class must implement the abstract `apply(gameGraph: GameGraph): Promise<void>` method. This is where the effect's game logic lives.

The `GameGraph` is the central API for reading and mutating game state. Understanding its methods is essential:

#### Core GameGraph API

| Method                                                            | Purpose                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `gameGraph.mutate((state) => outcome)`                            | Synchronous state mutation. The callback receives `MutableGameState` and can return an outcome value that will be stored in the graph node. |
| `await gameGraph.requestTargets(target?, options?)`               | Ask the player to select targets. Returns `Array<EntityId>`.                                                                                |
| `await gameGraph.requestSingleTarget(target?, options?)`          | Ask for exactly one target. Returns `EntityId \| undefined`.                                                                                |
| `await gameGraph.requestPlayers(target?, options?)`               | Ask the player to select players. Returns `Array<PlayerId>`.                                                                                |
| `await gameGraph.test({ subjectId, targetId, proficiency, ... })` | Run a proficiency test (draw fate token, apply modifiers, determine result).                                                                |
| `await gameGraph.triggerEvent(eventType, context?)`               | Emit a game event that other cards may react to.                                                                                            |
| `await gameGraph.defeat(targetId)`                                | Defeat a player or discard/banish a card.                                                                                                   |
| `gameGraph.current.state`                                         | Access the current read-only game state.                                                                                                    |

#### State access via `gameGraph.current.state`

The read-only state provides accessors like:

- `state.requireSubject()` / `state.getSubject()` — the entity performing the effect
- `state.requireTarget()` / `state.getTarget()` — the current target entity
- `state.requireActivePlayer()` / `state.getActivePlayer()` — the currently active player
- `state.requireActiveCard()` / `state.getActiveCard()` — the currently active card
- `state.requireEntityState(id)` / `state.requirePlayer(id)` / `state.requireCard(id)` — look up an entity by id
- `state.evaluate(expression)` — evaluate a scalar expression in the current context
- `state.getPlayerLocation(playerId)` — get a player's current location
- `state.cards({ ready: true })` — iterate over cards matching a filter

#### Common apply() patterns

**Pattern 1: Simple mutation** — for effects that just modify state without player input:

```typescript
override async apply(gameGraph: GameGraph) {
    gameGraph.mutate((state) => {
        const subject = state.requireSubject();
        subject.someField = newValue;
    });
}
```

Example: `ConferPropertiesEffect`, `ModifyDamageEffect`.

**Pattern 2: Target + mutation** — for effects that need the player to choose a target first:

```typescript
override async apply(gameGraph: GameGraph) {
    const targetIds = await gameGraph.requestTargets(this.target, { default: 'current-target' });
    for (const targetId of targetIds) {
        gameGraph.mutate((state) => {
            const target = state.requireEntityState(targetId);
            // modify target
        });
    }
}
```

Example: `WoundEffect`, `AttachEffect`.

**Pattern 3: Event-driven mutation** — for effects that trigger game events around state changes:

```typescript
override async apply(gameGraph: GameGraph) {
    // Validate preconditions
    const subjectId = gameGraph.current.state.requireSubject().id;
    const player = gameGraph.current.state.requirePlayer(subjectId);
    if (player.hasProperty(someBlockingProperty)) return;

    await gameGraph.triggerEvent('beforeAction', { subjectId });
    gameGraph.mutate((state) => {
        // perform the action
    });
    await gameGraph.triggerEvent('afterAction', { subjectId });
}
```

Example: `MoveEffect`.

**Pattern 4: Test-based** — for effects that run a proficiency test:

```typescript
override async apply(gameGraph: GameGraph) {
    const subjectId = gameGraph.current.state.requireSubject().id;
    const targetIds = await gameGraph.requestTargets(this.target);
    for (const targetId of targetIds) {
        await gameGraph.test({
            subjectId,
            targetId,
            proficiency: this.expression,
            properties: this.properties,
            effects: [/* test-modifying effects */],
            beforeTest: async (graph) => {
                await graph.triggerEvent('beforeTestEvent');
            }
        });
    }
}
```

Example: `AttackEffect`.

**Pattern 5: Request player input** — when the effect needs custom input (not just targets):

```typescript
override async apply(gameGraph: GameGraph) {
    const { result } = await gameGraph.requestInput([
        new SomeCustomField({ name: 'result', ... })
    ]);
    // use result
}
```

**Pattern 6: Async mutation** — use `await gameGraph.mutate(...)` (note the `await`) when the mutation callback is async or returns a promise:

```typescript
override async apply(gameGraph: GameGraph) {
    await gameGraph.mutate((state) => {
        const player = state.requireActivePlayer();
        const drawnCards = player.drawFromDeck(state, this.amount);
        return { cards: drawnCards.map(card => card.id) };
    });
}
```

Example: `DrawCardsEffect`.

#### Design guidelines

- **Prefer `gameGraph.mutate()`** for all state changes. Never modify state objects directly outside of a mutation callback.
- **Use `gameGraph.current.state`** (read-only) for reading state _before_ deciding what mutations to make.
- **Use `require*` accessors** (e.g. `requireSubject()`, `requirePlayer(id)`) when the entity must exist — they throw descriptive errors if missing. Use `get*` variants when absence is expected.
- **Return outcomes from `mutate()`** when the caller needs structured data about what happened (e.g. `DrawCardsOutcome`, `AttachOutcome`). Define an outcome interface inline or in the effect file.
- **Validate preconditions early** with early returns before any mutations.
- **Trigger events** for actions other cards might react to (movement, damage, attacks, etc.). Check existing event types in `packages/game/src/models/event.ts`.
- **Use `testTiming`** (imported from `./effect`: `BeforeTest`, `DuringTest`, `AfterTest`) when the effect modifies a test in progress rather than being a standalone action.
- **Keep `apply()` focused** — delegate complex sub-logic to private methods (e.g. `WoundEffect` has `computeBaseDamage()` and `applyReductions()` helpers).

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
   - Implement the `apply(gameGraph: GameGraph)` method — see [Implementing apply()](#implementing-apply) above for patterns and API reference
   - Export a factory function (camelCase, e.g. `modifyDamage`) — use shorthand support for single-required-property effects
2. **Barrel-export** from `packages/game/src/models/effects/index.ts`:
   - Export both the factory function and the class
3. **Create the chip component** `{ClassName}EffectChip.svelte` in `packages/web/src/lib/components/effects/`:
   - Accept an `effect` prop typed to the new class (import from `@songsofdoom/game`)
   - Render localised text using `<Text>` with `ca`/`es`/`en` props
4. **Update the dispatcher** in `packages/web/src/lib/components/effects/EffectChip.svelte`:
   - Import the new effect class from `@songsofdoom/game` and the chip component
   - Add an `{:else if effect instanceof NewEffect}` branch rendering the new chip

Make sure to use the /svelte-component skill to follow project conventions when creating
or updating Svelte files.

After completing all changes, run `npm run format` to ensure consistent formatting via Prettier.
