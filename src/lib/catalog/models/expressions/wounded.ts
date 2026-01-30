import type { LocalisedText } from '$lib/localisation';
import type { ComparisonOperator } from './comparison';
import { gte } from './comparison';
import { ScalarExpression } from './scalar-expression';
import type { ScalarExpressionType } from './scalar-operation';

export class RemainingWoundsExpression extends ScalarExpression {
	translate(): LocalisedText {
		return {
			ca: 'Ferides restants',
			es: 'Heridas restantes',
			en: 'Remaining wounds'
		};
	}
}

export const remainingWounds = new RemainingWoundsExpression();

export class ReceivedWoundsExpression extends ScalarExpression {
	translate(): LocalisedText {
		return {
			ca: 'Ferides rebudes',
			es: 'Heridas recibidas',
			en: 'Received wounds'
		};
	}

	/**
	 * Returns localized shorthand text for common received wounds comparisons.
	 */
	getComparisonShorthand(
		operator: ComparisonOperator,
		value: ScalarExpressionType
	): LocalisedText | undefined {
		if ((operator === '>' && value === 0) || (operator === '>=' && value === 1)) {
			return {
				ca: 'Ferit',
				es: 'Herido',
				en: 'Wounded'
			};
		} else if ((operator === '=' && value === 0) || (operator === '<' && value === 1)) {
			return {
				ca: 'Il·lès',
				es: 'Ileso',
				en: 'Not wounded'
			};
		}
		return undefined;
	}
}

export const receivedWounds = new ReceivedWoundsExpression();

export const wounded = gte(receivedWounds, 1);
