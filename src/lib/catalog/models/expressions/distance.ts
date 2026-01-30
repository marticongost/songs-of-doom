import type { LocalisedText } from '$lib/localisation';
import type { ComparisonOperator } from './comparison';
import { ScalarExpression } from './scalar-expression';
import type { ScalarExpressionType } from './scalar-operation';

/**
 * A scalar expression that returns the distance (in steps) to a target.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * Examples:
 * - `eq(distance, 0)` - at the same location
 * - `lte(distance, 1)` - adjacent or same location
 * - `lte(distance, 2)` - within 2 steps
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
				ca: 'Mateixa ubicació',
				es: 'Misma ubicación',
				en: 'Same location'
			};
		}
		if (operator === '=' && value === 1) {
			return {
				ca: 'Ubicació adjacent',
				es: 'Ubicación adyacente',
				en: 'Adjacent location'
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
