import type { LocalisedText } from '@songsofdoom/common/localisation';
import { CardState } from '../../game/cardstate';
import type { GameState } from '../../game/gamestate';
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

	override evaluate(state: GameState): boolean {
		const subject = state.getSubject();
		return subject !== undefined && subject instanceof CardState && subject.exhausted;
	}
}

/**
 * Singleton instance representing the "exhausted in combat" condition.
 */
export const exhausted = new ExhaustedExpression();
