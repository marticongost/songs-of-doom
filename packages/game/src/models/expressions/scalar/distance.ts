import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { ComparisonOperator } from '../../expressions/boolean/comparison';
import { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

/**
 * A scalar expression that returns the distance (in steps) to a target.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * Examples:
 * - `eq(distance, 0)` - at the same location
 * - `lte(distance, 1)` - adjacent or same location (normalizes to `lt(distance, 2)`)
 * - `lte(distance, 2)` - within 2 steps (normalizes to `lt(distance, 3)`)
 */
export class DistanceExpression extends ScalarExpression {
	translate(): LocalisedText {
		return {
			ca: 'distància',
			es: 'distancia',
			en: 'distance'
		};
	}

	/**
	 * Returns localized shorthand text for common distance comparisons.
	 */
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
		if (operator === '=' && value === 1) {
			return {
				ca: 'a una ubicació adjacent',
				es: 'en una ubicación adyacente',
				en: 'in an adjacent location'
			};
		}
		return undefined;
	}
}

/**
 * Singleton instance representing the distance to a target.
 * Use in comparisons: `eq(distance, 0)`, `lte(distance, 1)`, etc.
 */
export const distance = new DistanceExpression();
