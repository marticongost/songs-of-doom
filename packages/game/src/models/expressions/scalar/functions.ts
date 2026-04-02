import type { GameState } from '../../game/gamestate';
import { Stat } from '../../stats';
import { type ScalarExpressionType, ScalarExpression } from './scalar-expression';

/**
 * Returns 1 if the expression is guaranteed to be singular (the number 1),
 * otherwise returns 2 to indicate potential plurality.
 *
 * This is useful for pluralization where we need to decide between singular
 * and plural forms when the actual value won't be known until runtime.
 */
export const expressionPlurality = (expr: ScalarExpressionType): 1 | 2 => {
	return expr === 1 ? 1 : 2;
};

/** Evaluates a scalar expression in the context of the given game state.
 * @param expr The scalar expression to evaluate, which can be a number, a stat or an
 * expression object.
 */
export const evaluateScalar = (expr: ScalarExpressionType, state: GameState): number => {
	if (typeof expr === 'number') {
		return expr;
	} else if (expr instanceof Stat) {
		return state.requireActivePlayer().getStat(expr);
	} else if (expr instanceof ScalarExpression) {
		return expr.evaluate(state);
	}
	throw new Error('Invalid scalar expression type');
};
