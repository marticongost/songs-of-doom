import type { LocalisedText } from '$lib/localisation';
import { finalise } from '$lib/modelling';
import { Target } from '../target';
import { ScalarExpression } from './scalar-expression';

/**
 * Props for creating a ChargesExpression.
 */
export interface ChargesExpressionProps {
	/** The target card whose charges are to be counted. */
	target?: Target;
}

/**
 * A scalar expression that returns the number of charges held by a target card.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * Examples:
 * - `gt(new ChargesExpression({ target: new Target('self') }), 0)` - has at least 1 charge
 * - `gte(new ChargesExpression({ target: new Target('ownedObject') }), 3)` - owned object has at least 3 charges
 */
export class ChargesExpression extends ScalarExpression {
	/** The target card whose charges are to be counted. */
	readonly target: Target;

	constructor({ target }: ChargesExpressionProps) {
		super();
		this.target = finalise(Target, target ?? 'self');
	}

	translate(): LocalisedText {
		return {
			ca: 'càrregues',
			es: 'cargas',
			en: 'charges'
		};
	}
}

export const charges = new ChargesExpression({});
