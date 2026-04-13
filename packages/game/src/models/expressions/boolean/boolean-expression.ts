import { conditional, ConditionalEffect } from '../../effects/conditional';
import type { Effect } from '../../effects/effect';
import { Expression } from '../../expressions/expression';
import type { GameState } from '../../game/gamestate';
import type { Property } from '../../properties';

/**
 * Base class for expressions that produce boolean (true/false) values.
 * Boolean expressions can be used as conditions for effects and targets.
 */
export abstract class BooleanExpression extends Expression {
	/**
	 * Convenience method that creates a conditional effect with a single branch based
	 * on this boolean expression.
	 * @param effects The effects to execute if this expression evaluates to true.
	 * @returns A ConditionalEffect that wraps these effects.
	 */
	then(...effects: Array<Effect>): ConditionalEffect {
		return conditional([{ condition: this, effects }]);
	}

	/** Obtains the boolean value of the expression for the given game state.
	 * @param state The game state to evaluate the expression against.
	 * @return The boolean value of the expression in the given state.
	 */
	abstract evaluate(state: GameState): boolean;
}

/**
 * A type union representing all possible boolean expressions.
 * Includes primitives (boolean), comparisons, logical operators, properties, and custom boolean expressions.
 */
export type BooleanExpressionType = boolean | Property | BooleanExpression;
