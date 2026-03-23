---
name: add-expression
description: Create TypeScript classes and Svelte component integration for new boolean or scalar expressions in the game system.
---

# Add a new expression

## When to use this skill

Use this skill when the user needs to define a new type of expression—either a boolean expression (producing true/false values) or a scalar expression (producing numeric values).

## Expression types

There are two main categories of expressions:

1. **Boolean expressions** extend `BooleanExpression` and represent conditions or predicates (e.g., "is engaged", "has property X")
2. **Scalar expressions** extend `ScalarExpression` and represent numeric values (e.g., "distance to target", "count of targets")

## Model conventions

Expression models are in the `@songsofdoom/game` package.

### Basic structure

- **File location**: Expressions are organized into subpackages by type:
  - Boolean expressions: `packages/game/src/models/expressions/boolean/`
  - Scalar expressions: `packages/game/src/models/expressions/scalar/`
- **File name**: kebab-case (e.g. `engaged.ts`, `distance.ts`, `count.ts`)
- **Class**: extends either `BooleanExpression` or `ScalarExpression` (imported from the subpackage)
- **Fields**: all `readonly`, assigned in the constructor
- **Constructor**: takes a single destructured props object when needed, calls `super()` first
- **JSDoc**: add doc comments to the interface (if any), the class, and every field

### The `translate()` method

All expressions inherit from `Expression`, which defines a `translate()` method returning `LocalisedText | undefined`. Override this to provide a localised label for the expression. The `ExpressionChip` component checks `translate()` first and renders its result via `<Text>`, so **expressions that implement `translate()` do not need any changes to `ExpressionChip`**.

### Singleton pattern (for stateless expressions)

Many expressions like `engaged` or `distance` don't need configuration. For these:

```typescript
// packages/game/src/models/expressions/boolean/engaged.ts
import type { LocalisedText } from '@songsofdoom/common/localisation';
import { BooleanExpression } from './boolean-expression';

/**
 * A boolean expression that checks if the subject is engaged in combat.
 * A character is considered engaged when they are in melee range with one or more enemies.
 *
 * To check for NOT engaged, use `not(engaged)` instead of a separate expression.
 */
export class EngagedExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: 'Enfrontat',
			es: 'Enfrentado',
			en: 'Engaged'
		};
	}
}

/**
 * Singleton instance representing the "engaged in combat" condition.
 * Use `not(engaged)` to check if NOT engaged.
 */
export const engaged = new EngagedExpression();
```

### Props pattern (for configurable expressions)

When an expression needs configuration, define a props interface:

```typescript
// packages/game/src/models/expressions/scalar/count.ts
import { Target, type TargetProps } from '../../target';
import { ScalarExpression } from './scalar-expression';

/**
 * Props for creating a CountExpression.
 */
export interface CountExpressionProps {
	/** The target to count. Can be a TargetProps shorthand or a Target instance. */
	target: TargetProps | Target;
}

/**
 * A scalar expression that returns the count of targets matching the specified criteria.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * The target can include a condition to further filter what is counted.
 *
 * Examples:
 * - `count('allEnemies')` - count all enemies
 * - `count({ type: 'allEnemies', condition: lte(distance, 2) })` - count enemies within 2 steps
 * - `gte(count('allEnemies'), 2)` - at least 2 enemies exist
 */
export class CountExpression extends ScalarExpression {
	/** The target to count. */
	readonly target: Target;

	constructor({ target }: CountExpressionProps) {
		super();
		this.target = target instanceof Target ? target : new Target(target);
	}
}

/**
 * Creates a CountExpression that counts the specified targets.
 */
export function count(target: TargetProps | Target): CountExpression {
	return new CountExpression({ target });
}
```

**Props interface conventions:**

- Named `{ClassName}Props`
- Standalone interface, does **not** extend any base interface
- Each property has a JSDoc comment

### Cross-package imports

Within the game package, use relative imports for cross-subpackage types:

```typescript
import type { ComparisonOperator } from '../boolean/comparison';
```

### Comparison shorthands (scalar expressions)

Scalar expressions can override `getComparisonShorthand(operator, value)` to provide localised text for specific comparison patterns. The `ComparisonExpression` class calls this automatically when rendering.

```typescript
// packages/game/src/models/expressions/scalar/distance.ts
import type { ComparisonOperator } from '../boolean/comparison';
import type { LocalisedText } from '@songsofdoom/common/localisation';
import { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

export class DistanceExpression extends ScalarExpression {
	translate(): LocalisedText {
		return { ca: 'distància', es: 'distancia', en: 'distance' };
	}

	getComparisonShorthand(
		operator: ComparisonOperator,
		value: ScalarExpressionType
	): LocalisedText | undefined {
		if (operator === '=' && value === 0) {
			return {
				ca: 'a la mateixa ubicació',
				es: 'en la misma ubicación',
				en: 'in the same location'
			};
		}
		return undefined;
	}
}
```

## Component integration

All expressions are rendered through a single `ExpressionChip.svelte` component in `packages/web/src/lib/components/expressions/`. It checks `translate()` first, then falls back to type-specific branches for built-in types (numbers, stats, operations, comparisons, logical operators, properties).

**Do not create separate chip components.** Most new expressions only need to implement `translate()` and will be rendered automatically.

### When ExpressionChip changes are needed

Only update `ExpressionChip.svelte` if the expression requires **custom rendering beyond localised text** (e.g., icons, special formatting, child components). In that case:

1. **Import** the new expression class from `@songsofdoom/game` at the top
2. **Add a render branch** in the `expressionNodeSnippet` snippet using `{:else if expression instanceof YourExpression}`
3. **Use `<Text>`** for all user-visible strings with `ca`/`es`/`en` props

## Tasks

When the user requests a new expression:

1. **Determine the expression type**: Ask the user or infer whether it should be a boolean or scalar expression
2. **Determine if props are needed**: Does the expression need configuration, or is it stateless?
3. **Create the model file** in the appropriate subpackage:
   - Boolean expressions: `packages/game/src/models/expressions/boolean/`
   - Scalar expressions: `packages/game/src/models/expressions/scalar/`
   - If stateless: Create class extending `BooleanExpression`/`ScalarExpression`, implement `translate()`, and export a singleton instance
   - If configurable: Create a `{ClassName}Props` interface and class with constructor, implement `translate()`
   - For scalar expressions with meaningful comparison shorthands, override `getComparisonShorthand()`
   - Add comprehensive JSDoc comments and usage examples
4. **Barrel-export** the new class (and any companion types/functions) from the subpackage's `index.ts`:
   - Boolean expressions: `packages/game/src/models/expressions/boolean/index.ts`
   - Scalar expressions: `packages/game/src/models/expressions/scalar/index.ts`
5. **Update ExpressionChip.svelte** (only if the expression needs custom rendering beyond localised text):
   - Location: `packages/web/src/lib/components/expressions/ExpressionChip.svelte`
   - Import the new expression class from `@songsofdoom/game`
   - Add an `{:else if expression instanceof NewExpression}` branch in the `expressionNodeSnippet`
   - Use the `/svelte-component` skill when updating the component

## Examples of expression categories

### Boolean expressions (extend BooleanExpression)

- State checks: `engaged` (singleton with `translate()`)
- Property checks: `Property` instances (properties extend `BooleanExpression`)
- Comparisons: `wounded` is `gte(receivedWounds, 1)` — a `ComparisonExpression`, not a custom class
- Logical operators (`and`, `or`, `not`) are handled separately

### Scalar expressions (extend ScalarExpression)

- Measurements: `distance` (singleton with `translate()` and `getComparisonShorthand()`)
- Counts: `CountExpression` (configurable with target props, requires custom ExpressionChip rendering)
- Wound tracking: `receivedWounds` (singleton with `translate()` and `getComparisonShorthand()`), `remainingWounds` (singleton with `translate()`)
- Stats and numeric primitives are handled separately

## Formatting

After completing all changes, run `npm run format` to ensure consistent formatting via Prettier.
