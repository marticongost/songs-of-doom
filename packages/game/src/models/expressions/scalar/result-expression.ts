import type { GameState } from '../../game/gamestate';
import { ScalarExpression } from './scalar-expression';

/**
 * A scalar expression that represents the number of successes obtained from the fate
 * bag for a given test.
 */
export class ResultExpression extends ScalarExpression {
	override evaluate(_state: GameState): number {
		// TODO
		return 0;
	}
}

/**
 * Singleton instance representing the result of a test.
 */
export const result = new ResultExpression();
