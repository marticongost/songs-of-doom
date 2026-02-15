import { TargetDiscriminator, type TargetDiscriminatorSpec } from '../../target';
import type { LocalisedText } from '@songsofdoom/common/localisation';
import { finalise } from '@songsofdoom/common';
import { ScalarExpression } from './scalar-expression';

/**
 * Props for creating a ChargesExpression.
 */
export interface ChargesExpressionProps {
	/** The target card whose charges are to be counted. */
	target?: TargetDiscriminator | TargetDiscriminatorSpec;
}

/**
 * A scalar expression that returns the number of charges held by a target card.
 * This is a scalar value that can be used in comparisons or arithmetic operations.
 *
 * Examples:
 * - `gt(new ChargesExpression({ target: new TargetDiscriminator('object') }), 0)` - object has at least 1 charge
 * - `gte(new ChargesExpression({ target: { type: 'object', condition: owned } }), 3)` - owned object has at least 3 charges
 */
export class ChargesExpression extends ScalarExpression {
	/** The target card whose charges are to be counted. */
	readonly target?: TargetDiscriminator;

	constructor({ target }: ChargesExpressionProps) {
		super();
		this.target = finalise(TargetDiscriminator, target);
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
