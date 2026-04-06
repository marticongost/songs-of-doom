import type { GameState } from '../../game/gamestate';
import { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

/**
 * An operator for a {@link ScalarOperation}.
 */
export type ScalarOperator = '+' | '-' | '*' | '/';

/**
 * An arithmetic operation between two scalar expressions.
 */
export class ScalarOperation extends ScalarExpression {
	/**
	 * The arithmetic operator to apply to the two operands.
	 */
	operator: ScalarOperator;

	/**
	 * The left operand.
	 */
	left: ScalarExpressionType;

	/**
	 * The right operand.
	 */
	right: ScalarExpressionType;

	constructor(left: ScalarExpressionType, operator: ScalarOperator, right: ScalarExpressionType) {
		super();
		this.operator = operator;
		this.left = left;
		this.right = right;
	}

	override evaluate(state: GameState): number {
		const leftValue = state.evaluate(this.left);
		const rightValue = state.evaluate(this.right);
		switch (this.operator) {
			case '+':
				return leftValue + rightValue;
			case '-':
				return leftValue - rightValue;
			case '*':
				return leftValue * rightValue;
			case '/':
				return leftValue / rightValue;
		}
	}
}

// Helper functions for creating scalar operations.
// Numeric literals are folded at construction time, and identity elements are eliminated.

export function plus(a: ScalarExpressionType, b: ScalarExpressionType): ScalarExpressionType {
	if (a === 0) return b;
	if (b === 0) return a;
	if (typeof a === 'number' && typeof b === 'number') return a + b;
	return typeof b === 'number' && b < 0
		? new ScalarOperation(a, '-', -b)
		: new ScalarOperation(a, '+', b);
}

export function minus(a: ScalarExpressionType, b: ScalarExpressionType): ScalarExpressionType {
	if (b === 0) return a;
	if (typeof a === 'number' && typeof b === 'number') return a - b;
	return new ScalarOperation(a, '-', b);
}

export function mult(a: ScalarExpressionType, b: ScalarExpressionType): ScalarExpressionType {
	if (a === 1) return b;
	if (b === 1) return a;
	if (typeof a === 'number' && typeof b === 'number') return a * b;
	return new ScalarOperation(a, '*', b);
}

export function div(a: ScalarExpressionType, b: ScalarExpressionType): ScalarExpressionType {
	if (b === 1) return a;
	if (typeof a === 'number' && typeof b === 'number') return a / b;
	return new ScalarOperation(a, '/', b);
}
