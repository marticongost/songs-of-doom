---
name: migrate-effect
description: Migrate legacy game model effects (with apply() on the model) to the new engine procedure pattern in @songsofdoom/engine.
---

# Migrate a legacy effect to the engine

## When to use this skill

Use this skill when migrating an existing effect that still implements `apply(gameGraph: GameGraph)` on the model class to the new engine procedure pattern. This skill is **temporary** — once all effects have been migrated to the engine, it can be removed.

> **Note:** For creating **new** effects with the engine procedure pattern from scratch, use the `/add-effect` skill instead.

## Background

Older effects implement `apply(gameGraph: GameGraph)` directly on the model class in `@songsofdoom/game`. In the new architecture, the model class is a pure data container — all execution logic lives in a procedure definition in the `@songsofdoom/engine` package.

The engine resolves the procedure for an effect by convention: `getEffectProcedureId()` maps the effect's class name to a `ProcedureId` enum value (e.g. `HealEffect` → `ProcedureId.HealEffect`).

## Migration steps

1. **Create the engine procedure** in `packages/engine/src/procedures/effects/{lowercase}proc.ts`:
   - Define a state interface extending `EffectProcedureState<TheEffect>` (imported from `../core/triggereffect`)
   - Use `instructions<StateType>()` (imported from `../../core/instructions`) to get pre-bound factory helpers
   - Export a procedure using `define()`, referencing the new `ProcedureId`
   - Translate the legacy `apply()` logic into procedure steps

2. **Add a `ProcedureId` entry** in `packages/engine/src/core/procedureid.ts` (if not already present):
   - Add a new enum member under the `// Effects` section whose string value matches the effect class name exactly

3. **Register the procedure** in `packages/engine/src/core/procedureregistry.ts`:
   - Import the procedure at the top
   - Add an entry in the `procedureDefinitions` record under the `// Effects` section

4. **Remove `apply()`** from the model class in `packages/game/src/models/effects/`:
   - Delete the `apply()` method entirely (whether it was active code or already commented out)
   - Remove the `GameGraph` import if no longer needed
   - The class should end up as a clean, empty class (e.g. `class FooEffect extends Effect {}`)

5. **Write tests** in `packages/engine/src/procedures/effects/{lowercase}proc.test.ts`:
   - Use `mock<T>()` from `@songsofdoom/common/test-utils` for dependencies
   - Write a `makeState(effect, game)` helper for concise test setup
   - Test each step's logic in isolation
   - See `/unit-tests` skill for conventions

## Migration mapping

| Old `apply()` pattern                                 | New procedure equivalent                                                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `gameGraph.mutate(cb)`                                | `mutateGameState((state, game) => { ... })` from `instructions`                                                |
| `await gameGraph.requestTargets(target)`              | `call(resolveTarget, { target, ... }, (state, result) => ({ ...state, targetIds: result.resolvedTargetIds }))` |
| `await gameGraph.requestSingleTarget(target)`         | `requireSingleTarget(target, 'fieldName')` from `instructions`                                                 |
| `await gameGraph.triggerEvent(type, ctx)`             | `emitEvent({ eventType: type, eventContext: ctx })` from `instructions`                                        |
| `await gameGraph.triggerEffect(effect)`               | `triggerEffect({ effect })` from `instructions`                                                                |
| `gameGraph.current.state.evaluate(expr)`              | `state.game.evaluateScalar(expr)` or `state.game.evaluateBoolean(expr)`                                        |
| `gameGraph.current.state.requireSubject()`            | `state.game.requireSubject()`                                                                                  |
| `gameGraph.current.state.requireTarget()`             | `state.game.requireTarget()`                                                                                   |
| `gameGraph.current.state.requireActivePlayer()`       | `state.game.requireActivePlayer()`                                                                             |
| `gameGraph.current.state.requireActiveCard()`         | `state.game.requireActiveCard()`                                                                               |
| `gameGraph.current.state.requireEntityState(id)`      | `state.game.requireEntityState(id)` / `game.requireEntityState(id)` inside `mutateGameState`                   |
| `gameGraph.current.state.requirePlayer(id)`           | `state.game.requirePlayer(id)` / `game.requirePlayer(id)` inside `mutateGameState`                             |
| `gameGraph.current.state.requireCard(id)`             | `state.game.requireCard(id)` / `game.requireCard(id)` inside `mutateGameState`                                 |
| `gameGraph.current.state.cards(filter)`               | `state.game.cards(filter)`                                                                                     |
| `gameGraph.current.state.getEntityLocation(playerId)` | `state.game.getEntityLocation(playerId)`                                                                       |
| `await gameGraph.test({ subjectId, ... })`            | Use a dedicated test procedure via `call(proficiencyTestProcedure, { subjectId, ... })`                        |
| `await gameGraph.requestInput(fields)`                | `input({ fields, then: (state, inputs) => ({ ...state, ...inputs }) })` from `instructions`                    |
| `await gameGraph.defeat(targetId)`                    | `call(defeatProcedure, { targetId })`                                                                          |
| `for (const id of ids) { ... }`                       | `forEach({ name: 'id', items: (state) => ids, steps: { ... } })` from `instructions`                           |

## The `instructions` API

Import from `../../core/instructions` in engine procedure files:

```typescript
import { instructions } from '../../core/instructions';

interface MyEffectState extends EffectProcedureState<MyEffect> {
	/* extra fields */
}

const {
	define,
	forEach,
	call,
	triggerEffect,
	requireSingleTarget,
	emitEvent,
	mutateGameState,
	input,
	dispatch
} = instructions<MyEffectState>();
```

| Helper                                           | Purpose                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `define({ id, steps })`                          | Create a `ProcedureDefinition`.                                       |
| `forEach({ name, items, steps, where?, then? })` | Iterate over a list. Sets `state[name]` each iteration.               |
| `call(procedure, parameters?, then?)`            | Call a child procedure.                                               |
| `triggerEffect({ effect, parameters?, then? })`  | Trigger the child procedure for an effect.                            |
| `requireSingleTarget(target, fieldName)`         | Resolve a target to a single entity ID, stored in `state[fieldName]`. |
| `emitEvent({ eventType, eventContext? })`        | Emit a game event.                                                    |
| `mutateGameState((state, game) => { ... })`      | Mutate game state in place. Auto-returns updated state.               |
| `input({ fields, then? })`                       | Request player input.                                                 |
| `dispatch((state) => step)`                      | Dispatch to another step based on state.                              |

## Legacy GameGraph API reference

When reading legacy `apply()` code, the following `GameGraph` methods may appear. **Do not use these in new code.**

| Method                                                            | Purpose                                                                            |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `gameGraph.mutate((state) => outcome)`                            | Synchronous state mutation. Callback receives `MutableGameState`, returns outcome. |
| `await gameGraph.requestTargets(target?, options?)`               | Ask the player to select targets. Returns `Array<EntityId>`.                       |
| `await gameGraph.requestSingleTarget(target?, options?)`          | Ask for exactly one target. Returns `EntityId \| undefined`.                       |
| `await gameGraph.requestPlayers(target?, options?)`               | Ask the player to select players. Returns `Array<PlayerId>`.                       |
| `await gameGraph.test({ subjectId, targetId, proficiency, ... })` | Run a proficiency test.                                                            |
| `await gameGraph.triggerEvent(eventType, context?)`               | Emit a game event for reactions.                                                   |
| `await gameGraph.triggerEffect(effect)`                           | Trigger a child effect.                                                            |
| `await gameGraph.defeat(targetId)`                                | Defeat a player or discard/banish a card.                                          |
| `gameGraph.current.state`                                         | Access the current read-only game state.                                           |

### Legacy state access via `gameGraph.current.state`

- `state.requireSubject()` / `state.getSubject()` — the entity performing the effect
- `state.requireTarget()` / `state.getTarget()` — the current target entity
- `state.requireActivePlayer()` / `state.getActivePlayer()` — the currently active player
- `state.requireActiveCard()` / `state.getActiveCard()` — the currently active card
- `state.requireEntityState(id)` / `state.requirePlayer(id)` / `state.requireCard(id)` — look up an entity by id
- `state.evaluate(expression)` — evaluate a scalar expression in the current context
- `state.evaluateScalar(expression)` — evaluate a scalar expression
- `state.evaluateBoolean(expression)` — evaluate a boolean expression
- `state.getEntityLocation(playerId)` — get a player's current location
- `state.cards({ ready: true })` — iterate over cards matching a filter

## Migration walkthrough: ConditionalEffect

### Before (game model `packages/game/src/models/effects/conditional.ts`)

```typescript
override async apply(gameGraph: GameGraph) {
    for (const { condition, effects } of this.cases) {
        if (gameGraph.current.state.evaluate(condition)) {
            for (const effect of effects) {
                await gameGraph.triggerEffect(effect);
            }
        } else if (this.default) {
            for (const effect of this.default) {
                await gameGraph.triggerEffect(effect);
            }
        }
    }
}
```

This `apply()` is removed entirely, leaving `class ConditionalEffect extends Effect {}`.

### After (engine procedure `packages/engine/src/procedures/effects/conditionalproc.ts`)

```typescript
import type { ConditionalEffect, Effect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export interface ConditionalEffectState extends EffectProcedureState<ConditionalEffect> {
	currentEffect?: Effect;
}

const { define, forEach, triggerEffect } = instructions<ConditionalEffectState>();

export const conditionalEffectProc = define({
	id: ProcedureId.ConditionalEffect,
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

### Key transformations

1. Removed `apply()` from the model — it's now a pure data class
2. Added `ProcedureId.ConditionalEffect` to the enum
3. Created the procedure file with a state interface and step definitions
4. `gameGraph.current.state.evaluate(condition)` → `state.game.evaluateBoolean(c.condition)`
5. `await gameGraph.triggerEffect(effect)` → `triggerEffect({ effect })` as a sub-step
6. The `for` loop became a `forEach` step with dynamic `items`

## Migration walkthrough: ConferPropertiesEffect

### Before (game model)

```typescript
override async apply(gameGraph: GameGraph) {
    gameGraph.mutate((state) => {
        const target = state.requireTarget();
        for (const conferedProperty of this.properties) {
            this.addProperty(conferedProperty, target);
        }
    });
}
```

This `apply()` is removed entirely, leaving `class ConferPropertiesEffect extends Effect {}`.

### After (engine procedure)

```typescript
import type { ConferPropertiesEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ConferPropertiesEffectState = EffectProcedureState<ConferPropertiesEffect>;

const { define, mutateGameState } = instructions<ConferPropertiesEffectState>();

export const conferPropertiesEffectProc = define({
	id: ProcedureId.ConferPropertiesEffect,
	steps: {
		mutate: mutateGameState((state, game) => {
			const target = game.requireTarget();
			for (const conferedProperty of state.effect.properties) {
				target.addProperty(conferedProperty);
			}
		})
	}
});
```

### Key transformations

1. `gameGraph.mutate((state) => { ... })` → `mutateGameState((state, game) => { ... })`
2. `state.requireTarget()` (on `MutableGameState`) → `game.requireTarget()` (the `game` param)
3. `this.properties` → `state.effect.properties`
4. No more `async` — `mutateGameState` is synchronous

## Migration walkthrough: HealEffect

### Before (game model — legacy apply)

```typescript
override async apply(gameGraph: GameGraph): Promise<void> {
    const targetId = await gameGraph.requestSingleTarget(this.target, {
        default: 'current-subject'
    });

    if (targetId) {
        gameGraph.mutate((state) => {
            const amount = state.evaluateScalar(this.amount);
            const target = state.requireEntityState(targetId) as { physicalTrauma: number };
            const actualAmount = Math.min(amount, target.physicalTrauma);
            target.physicalTrauma -= actualAmount;
            return { amount: actualAmount, targetId } satisfies HealOutcome;
        });
    }
}
```

This `apply()` is removed entirely, leaving `class HealEffect extends Effect {}`.

### After (engine procedure — to be created)

```typescript
import type { HealEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export interface HealEffectState extends EffectProcedureState<HealEffect> {
	targetId?: string;
}

const { define, requireSingleTarget, mutateGameState } = instructions<HealEffectState>();

export const healEffectProc = define({
	id: ProcedureId.HealEffect,
	steps: {
		resolveTarget: requireSingleTarget(
			(state) => state.effect.target ?? 'current-subject',
			'targetId'
		),
		applyHealing: mutateGameState((state, game) => {
			const amount = game.evaluateScalar(state.effect.amount);
			const target = game.requireEntityState(state.targetId!) as { physicalTrauma: number };
			const actualAmount = Math.min(amount, target.physicalTrauma);
			target.physicalTrauma -= actualAmount;
		})
	}
});
```

### Key transformations

1. `await gameGraph.requestSingleTarget(this.target, { default })` → `requireSingleTarget((state) => state.effect.target ?? 'current-subject', 'targetId')`
2. `state.evaluateScalar(this.amount)` (on `MutableGameState`) → `game.evaluateScalar(state.effect.amount)`
3. The two-step pattern (resolve target → mutate) maps cleanly to two procedure steps

## Migration status

### Migrated (engine procedure exists, `apply()` fully removed)

| Effect                   | Procedure file            |
| ------------------------ | ------------------------- |
| `AttachEffect`           | `attachproc.ts`           |
| `ConferPropertiesEffect` | `conferpropertiesproc.ts` |
| `ConditionalEffect`      | `conditionalproc.ts`      |
| `DiscardEffect`          | `discardproc.ts`          |
| `DrawFocusEffect`        | `drawfocusproc.ts`        |

### `apply()` commented out but no procedure yet

These have had their `apply()` body commented out but still need an engine procedure:

- `AttackEffect` (`attack.ts`)
- `DrawCardsEffect` (`drawcards.ts`)
- `HealEffect` (`heal.ts`)

### Active `apply()` — needs full migration

These still have active (uncommented) `apply()` methods:

- `DiscardFromHandEffect` (`discardfromhand.ts`)
- `EngageEffect` (`engage.ts`)
- `ExhaustEffect` (`exhaust.ts`)
- `GatherCluesEffect` (`gatherclues.ts`)
- `ModifyDamageEffect` (`modifydamage.ts`)
- `MoveEffect` (`move.ts`)
- `NegateDamageEffect` (`negatedamage.ts`)
- `RecoverSanityEffect` (`recoversanity.ts`)
- `RedrawFocusEffect` (`redrawfocus.ts`)
- `WoundEffect` (`wound.ts`)
