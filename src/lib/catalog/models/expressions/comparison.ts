import type { LocalisedText } from '$lib/localisation';
import { BooleanExpression } from './boolean-expression';
import { ScalarExpression } from './scalar-expression';
import { ScalarOperation, type ScalarExpressionType } from './scalar-operation';

/**
 * A comparison operator between two scalar values.
 * Note: gte() and lte() helpers normalize to > and < for integer comparisons.
 */
export type ComparisonOperator = '>' | '=' | '!=' | '<';

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

	/**
	 * Returns a localized shorthand text if the left operand provides one for this comparison.
	 * Delegates to the left operand's getComparisonShorthand method.
	 */
	translate(): LocalisedText | undefined {
		if (this.left instanceof ScalarExpression) {
			return this.left.getComparisonShorthand(this.operator, this.right);
		}
		return undefined;
	}
}

// Helper functions for creating comparisons
export const eq = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '=', b);
export const neq = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '!=', b);
export const gt = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '>', b);
export const lt = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison =>
	new Comparison(a, '<', b);

/**
 * Greater-than-or-equal comparison helper.
 * Normalizes to `>` operator: `gte(a, b)` becomes `a > (b - 1)`.
 */
export const gte = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison => {
	const normalizedB = typeof b === 'number' ? b - 1 : new ScalarOperation(b, '-', 1);
	return new Comparison(a, '>', normalizedB);
};

/**
 * Less-than-or-equal comparison helper.
 * Normalizes to `<` operator: `lte(a, b)` becomes `a < (b + 1)`.
 */
export const lte = (a: ScalarExpressionType, b: ScalarExpressionType): Comparison => {
	const normalizedB = typeof b === 'number' ? b + 1 : new ScalarOperation(b, '+', 1);
	return new Comparison(a, '<', normalizedB);
};
