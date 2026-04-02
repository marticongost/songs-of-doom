import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { GameState } from '../../game/gamestate';
import { ScalarExpression } from './scalar-expression';

export class HandSizeExpression extends ScalarExpression {
	translate(): LocalisedText {
		return {
			ca: 'Cartes a la ma',
			es: 'Cartas en la mano',
			en: 'Cards in hand'
		};
	}

	override evaluate(state: GameState): number {
		return state.requireActivePlayer().hand.length;
	}
}

export const handSize = new HandSizeExpression();
