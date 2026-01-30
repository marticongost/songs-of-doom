import { Stat } from '../stats';
import { ScalarExpression } from './scalar-expression';

/**
 * An operator for a {@link ScalarOperation}.
 */
export type ScalarOperator = '+' | '-' | '*' | '/';

/**
 * A type union representing all possible scalar expressions.
 * Includes primitives (number, Stat, 'result') and complex expressions (ScalarOperation).
 */
export type ScalarExpressionType = Stat | number | 'result' | ScalarOperation | ScalarExpression;

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
}

// Helper functions for creating scalar operations
export const plus = (a: ScalarExpressionType, b: ScalarExpressionType): ScalarOperation =>
	new ScalarOperation(a, '+', b);
export const minus = (a: ScalarExpressionType, b: ScalarExpressionType): ScalarOperation =>
	new ScalarOperation(a, '-', b);
export const mult = (a: ScalarExpressionType, b: ScalarExpressionType): ScalarOperation =>
	new ScalarOperation(a, '*', b);
export const div = (a: ScalarExpressionType, b: ScalarExpressionType): ScalarOperation =>
	new ScalarOperation(a, '/', b);
