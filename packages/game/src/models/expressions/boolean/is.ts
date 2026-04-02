import { finalise } from '@songsofdoom/common';
import type { GameState } from '../../game/gamestate';
import { Target, type TargetSpec } from '../../target';
import { BooleanExpression, type BooleanExpressionType } from './boolean-expression';

/** Constructor parameters for the {@link IsExpression} class. */
export interface IsExpressionProps {
	/** The target to check the expressions against. */
	target: TargetSpec;

	/** The expression to check. */
	expression: BooleanExpressionType;
}

/** An expression that checks if a target satisfies a given boolean expression. */
export class IsExpression extends BooleanExpression {
	/** The target to check the expressions against. */
	readonly target: Target;

	/** The expression to check. */
	readonly expression: BooleanExpressionType;

	constructor({ target, expression }: IsExpressionProps) {
		super();
		this.target = finalise(Target, target);
		this.expression = expression;
	}

	override evaluate(_state: GameState): boolean {
		// TODO
		return false;
	}
}

/** Creates an expression that checks if a target satisfies a given boolean expression.
 * @param target - The target to check the expression against.
 * @param expression - The expression to check.
 */
export const is = (target: TargetSpec, expression: BooleanExpressionType) =>
	new IsExpression({ target, expression });
