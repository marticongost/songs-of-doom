import type { LocalisedText } from '@songsofdoom/common/localisation';
import { BooleanExpression } from './boolean-expression';

/**
 * A boolean expression that checks if the subject is exhausted..
 */
export class ExhaustedExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: 'Exhaurit',
			es: 'Exhausto',
			en: 'Exhausted'
		};
	}
}

/**
 * Singleton instance representing the "exhausted in combat" condition.
 */
export const exhausted = new ExhaustedExpression();
