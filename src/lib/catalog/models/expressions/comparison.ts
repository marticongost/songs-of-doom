import { BooleanExpression } from './boolean-expression';
import type { ScalarExpressionType } from './scalar-operation';

/**
 * A comparison operator between two scalar values.
 */
export type ComparisonOperator = '>' | '>=' | '=' | '!=' | '<' | '<=';

/**
 * A comparison operation between two scalar values.
 * Produces a boolean result based on the comparison operator.
 */
export class Comparison extends BooleanExpression {
	/**
	 * The comparison operator to apply to the two operands.
	 */
	operator: ComparisonOperator;

	/**
	 * The left operand.
	 */
	left: ScalarExpressionType;

	/**
	 * The right operand.
	 */
	right: ScalarExpressionType;

	constructor(left: ScalarExpressionType, operator: ComparisonOperator, right: ScalarExpressionType) {
		super();
		this.operator = operator;
		this.left = left;
		this.right = right;
	}
}

// Helper functions for creating comparisons
export const eq = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '=', b);
export const neq = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '!=', b);
export const gt = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '>', b);
export const gte = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '>=', b);
export const lt = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '<', b);
export const lte = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '<=', b);
