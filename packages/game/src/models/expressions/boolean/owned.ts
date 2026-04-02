import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { GameState } from '../../game/gamestate';
import { BooleanExpression } from './boolean-expression';

/**
 * A boolean expression that checks if the target object is owned by the subject.
 * This is used to filter targets to only those objects that belong to the acting character.
 */
export class OwnedExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: 'propi',
			es: 'propio',
			en: 'owned'
		};
	}

	override evaluate(_state: GameState): boolean {
		// TODO
		return false;
	}
}

/**
 * Singleton instance representing the "owned by self" condition.
 * Use this to filter object targets to only those owned by the acting character.
 */
export const owned = new OwnedExpression();
