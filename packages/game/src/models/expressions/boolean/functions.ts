import type { GameState } from '../../game/gamestate';
import { type BooleanExpressionType, BooleanExpression } from './boolean-expression';

/** Obtains the boolean value of a boolean expression type for the given game state.
 * @param expr The boolean expression to evaluate, which can be a boolean, a property or an
 * expression object.
 * @param state The game state to evaluate the expression against.
 * @return The boolean value of the expression in the given state.
 */
export const evaluateBoolean = (expr: BooleanExpressionType, state: GameState): boolean => {
	if (typeof expr === 'boolean') {
		return expr;
	} else if (expr instanceof BooleanExpression) {
		return expr.evaluate(state);
	}
	throw new Error('Invalid boolean expression type');
};
