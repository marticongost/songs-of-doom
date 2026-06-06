import type { LocalisedText } from '@songsofdoom/common/localisation';
import { ScalarExpression } from './scalar-expression';

export class HandSizeExpression extends ScalarExpression {
	translate(): LocalisedText {
		return {
			ca: 'Cartes a la ma',
			es: 'Cartas en la mano',
			en: 'Cards in hand'
		};
	}
}

export const handSize = new HandSizeExpression();
