import type { GameState } from '../../game/gamestate';
import { ScalarExpression } from './scalar-expression';

/** Represents the amount of gold a character carries on their person. */
export class CashExpression extends ScalarExpression {
	override evaluate(_state: GameState): number {
		// TODO
		return 0;
	}
}

export const cash = new CashExpression();
