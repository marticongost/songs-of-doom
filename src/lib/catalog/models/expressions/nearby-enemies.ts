import type { LocalisedText } from '$lib/localisation';
import { ScalarExpression } from './scalar-expression';

/**
 * Props for creating a NearbyEnemiesExpression.
 */
export interface NearbyEnemiesExpressionProps {
	/** The maximum distance (in steps) within which to count enemies. */
	distance: number;
}

/**
 * A scalar expression that returns the count of enemies within a specified distance.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * Examples:
 * - `gte(new NearbyEnemiesExpression({ distance: 0 }), 2)` - at least 2 enemies at same location (normalizes to `gt(..., 1)`)
 * - `gt(new NearbyEnemiesExpression({ distance: 1 }), 0)` - at least 1 enemy within 1 step
 */
export class NearbyEnemiesExpression extends ScalarExpression {
	/** The maximum distance (in steps) within which to count enemies. */
	readonly distance: number;

	constructor({ distance }: NearbyEnemiesExpressionProps) {
		super();
		this.distance = distance;
	}

	translate(): LocalisedText {
		return {
			ca: `enemics a ${this.distance} passos`,
			es: `enemigos a ${this.distance} pasos`,
			en: `enemies at ${this.distance} steps`
		};
	}
}
