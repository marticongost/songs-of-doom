import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { ComparisonOperator } from '../../expressions/boolean/comparison';
import type { GameState } from '../../game/gamestate';
import type { Stat } from '../../stats';
import { Expression } from '../expression';

/**
 * Base class for expressions that produce numeric (scalar) values.
 * Scalar expressions can be used in arithmetic operations and comparisons.
 */
export abstract class ScalarExpression extends Expression {
	/**
	 * Returns a localized shorthand text for comparisons involving this expression.
	 * For example, DistanceExpression can return "Same location" for operator "=" and value 0.
	 *
	 * @param _operator The comparison operator being used
	 * @param _value The value being compared against
	 * @returns A localized text if a shorthand exists, otherwise undefined
	 */
	getComparisonShorthand(
		_operator: ComparisonOperator,
		_value: ScalarExpressionType
	): LocalisedText | undefined {
		return undefined;
	}

	/** Obtains the value of the expression for the given game state.
	 * @param state The game state to evaluate the expression against.
	 * @return The numeric value of the expression in the given state.
	 */
	abstract evaluate(state: GameState): number;
}

/**
 * A type union representing all possible scalar expressions.
 * Includes primitives (number, Stat) and complex expressions (ScalarExpression).
 */
export type ScalarExpressionType = Stat | number | ScalarExpression;
