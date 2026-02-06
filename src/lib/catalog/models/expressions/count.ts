import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';
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
		this.target = finalise(Target, target);
	}
}

/**
 * Creates a CountExpression that counts the specified targets.
 *
 * @param target - The target to count. Can be a TargetProps shorthand or a Target instance.
 * @returns A CountExpression representing the count of matching targets.
 *
 * @example
 * // Count all enemies
 * count('allEnemies')
 *
 * @example
 * // Count enemies at the same location
 * count({ type: 'allEnemies', condition: eq(distance, 0) })
 *
 * @example
 * // Check if there are at least 2 enemies nearby
 * gte(count({ type: 'allEnemies', condition: lte(distance, 1) }), 2)
 */
export function count(target: TargetProps | Target): CountExpression {
	return new CountExpression({ target });
}
