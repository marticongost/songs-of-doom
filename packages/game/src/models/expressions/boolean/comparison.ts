import type { LocalisedText } from '@songsofdoom/common/localisation';
import {
	ScalarExpression,
	type ScalarExpressionType
} from '../../expressions/scalar/scalar-expression';
import { ScalarOperation } from '../../expressions/scalar/scalar-operation';
import { BooleanExpression } from './boolean-expression';

/**
 * A comparison operator between two scalar values.
 * Note: gte() and lte() helpers normalize to > and < for integer comparisons.
 */
export type ComparisonOperator = '>' | '=' | '!=' | '<';

/**
 * A comparison operation between two scalar values.
 * Produces a boolean result based on the comparison operator.
 */
export class ComparisonExpression extends BooleanExpression {
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

	constructor(
		left: ScalarExpressionType,
		operator: ComparisonOperator,
		right: ScalarExpressionType
	) {
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
export const eq = (a: ScalarExpressionType, b: ScalarExpressionType): ComparisonExpression =>
	new ComparisonExpression(a, '=', b);
export const neq = (a: ScalarExpressionType, b: ScalarExpressionType): ComparisonExpression =>
	new ComparisonExpression(a, '!=', b);
export const gt = (a: ScalarExpressionType, b: ScalarExpressionType): ComparisonExpression =>
	new ComparisonExpression(a, '>', b);
export const lt = (a: ScalarExpressionType, b: ScalarExpressionType): ComparisonExpression =>
	new ComparisonExpression(a, '<', b);

/**
 * Greater-than-or-equal comparison helper.
 * Normalizes to `>` operator: `gte(a, b)` becomes `a > (b - 1)`.
 */
export const gte = (a: ScalarExpressionType, b: ScalarExpressionType): ComparisonExpression => {
	const normalizedB = typeof b === 'number' ? b - 1 : new ScalarOperation(b, '-', 1);
	return new ComparisonExpression(a, '>', normalizedB);
};

/**
 * Less-than-or-equal comparison helper.
 * Normalizes to `<` operator: `lte(a, b)` becomes `a < (b + 1)`.
 */
export const lte = (a: ScalarExpressionType, b: ScalarExpressionType): ComparisonExpression => {
	const normalizedB = typeof b === 'number' ? b + 1 : new ScalarOperation(b, '+', 1);
	return new ComparisonExpression(a, '<', normalizedB);
};
