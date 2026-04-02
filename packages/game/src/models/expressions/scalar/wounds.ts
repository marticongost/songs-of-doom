import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { GameState } from '../../game/gamestate';
import type { ComparisonOperator } from '../boolean/comparison';
import { gte } from '../boolean/comparison';
import { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

export class RemainingWoundsExpression extends ScalarExpression {
	translate(): LocalisedText {
		return {
			ca: 'Ferides restants',
			es: 'Heridas restantes',
			en: 'Remaining wounds'
		};
	}

	override evaluate(_state: GameState): number {
		// TODO
		return 0;
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
		if (operator === '>' && value === 0) {
			return {
				ca: 'Ferit',
				es: 'Herido',
				en: 'Wounded'
			};
		} else if (operator === '=' && value === 0) {
			return {
				ca: 'Il·lès',
				es: 'Ileso',
				en: 'Not wounded'
			};
		}
		return undefined;
	}

	override evaluate(_state: GameState): number {
		// TODO
		return 0;
	}
}

export const receivedWounds = new ReceivedWoundsExpression();

export const wounded = gte(receivedWounds, 1);
