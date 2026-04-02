import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { GameState } from '../../game/gamestate';
import { BooleanExpression } from './boolean-expression';

/**
 * A boolean expression that checks if the target already has a copy of the
 * current card attached.
 *
 * This is useful for cards that should not be attached multiple times to the
 * same target, or for effects that behave differently when the card is already
 * present.
 */
export class CopyAlreadyAttachedExpression extends BooleanExpression {
	translate(): LocalisedText {
		return {
			ca: 'El jugador ja té una còpia de la carta adjunta',
			es: 'El jugador ya tiene una copia de la carta adjunta',
			en: 'The player already has a copy attached'
		};
	}

	override evaluate(_state: GameState): boolean {
		/* TODO: In order to implement this, we need to:
			- Option A: Track the current target in the game state so it can be referenced
			  by expressions.
			- Option B: Make the target explicit with a `target` property on the expression
			- Option C: Change the way attachments work, so that attach() has an optional
			  ifAlreadyAttached parameters with a list of effects, which would make this
				expression unnecessary.
		*/
		return false;
	}
}

/**
 * Singleton instance representing the "target already has a copy of this card
 * attached" condition.
 *
 * Use `not(copyAlreadyAttached)` to check if the target does NOT have a copy
 * attached.
 */
export const copyAlreadyAttached = new CopyAlreadyAttachedExpression();
