import { finalise } from '@songsofdoom/common';
import type { GameState } from '../../game/gamestate';
import { TargetDiscriminator, type TargetDiscriminatorSpec } from '../../target';
import { ScalarExpression } from './scalar-expression';

/**
 * Props for creating a CountExpression.
 */
export interface CountExpressionProps {
	/** The target to count. Can be a TargetDiscriminatorSpec shorthand or a TargetDiscriminator instance. */
	target: TargetDiscriminatorSpec | TargetDiscriminator;
}

/**
 * A scalar expression that returns the count of targets matching the specified criteria.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * The target can include a condition to further filter what is counted.
 *
 * Examples:
 * - `count('enemy')` - count all enemies
 * - `count({ type: 'enemy', condition: lte(distance, 2) })` - count enemies within 2 steps
 * - `gte(count('enemy'), 2)` - at least 2 enemies exist
 */
export class CountExpression extends ScalarExpression {
	/** The target to count. */
	readonly target: TargetDiscriminator;

	constructor({ target }: CountExpressionProps) {
		super();
		this.target = finalise(TargetDiscriminator, target);
	}

	override evaluate(_state: GameState): number {
		// TODO
		return 0;
	}
}

/**
 * Creates a CountExpression that counts the specified targets.
 *
 * @param target - The target to count. Can be a TargetDiscriminatorSpec shorthand or a TargetDiscriminator instance.
 * @returns A CountExpression representing the count of matching targets.
 *
 * @example
 * // Count all enemies
 * count('enemy')
 *
 * @example
 * // Count enemies at the same location
 * count({ type: 'enemy', condition: eq(distance, 0) })
 *
 * @example
 * // Check if there are at least 2 enemies nearby
 * gte(count({ type: 'enemy', condition: lte(distance, 1) }), 2)
 */
export function count(target: TargetDiscriminatorSpec | TargetDiscriminator): CountExpression {
	return new CountExpression({ target });
}
