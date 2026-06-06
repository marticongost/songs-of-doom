import type { LocalisedText } from '@songsofdoom/common/localisation';
import { BooleanExpression } from './boolean-expression';

/**
 * A boolean expression that checks if the target has been activated in the current
 * turn.
 */
export class ActivatedExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: 'Activat',
			es: 'Activado',
			en: 'Activated'
		};
	}
}

/**
 * Singleton instance representing the "activated" condition.
 */
export const activated = new ActivatedExpression();
