import { Stat } from './stats';

/**
 * An operator for a {@link ScalarOperation}.
 */
export type ScalarOperator = '+' | '-' | '*' | '/';

/**
 * An arithmetic operation between two scalar expressions.
 */
export class ScalarOperation {
	/**
	 * The arithmetic operator to apply to the two operands.
	 */
	operator: ScalarOperator;

	/**
	 * The left operand.
	 */
	left: ScalarExpression;

	/**
	 * The right operand.
	 */
	right: ScalarExpression;

	constructor(left: ScalarExpression, operator: ScalarOperator, right: ScalarExpression) {
		this.operator = operator;
		this.left = left;
		this.right = right;
	}
}

/**
 * A comparison operator between two scalar values.
 */
export type ComparisonOperator = '>' | '>=' | '=' | '!=' | '<' | '<=';

/**
 * A comparison operation between two scalar values.
 */
export class Comparison {
	/**
	 * The comparison operator to apply to the two operands.
	 */
	operator: ComparisonOperator;

	/**
	 * The left operand.
	 */
	left: ScalarExpression;

	/**
	 * The right operand.
	 */
	right: ScalarExpression;

	constructor(left: ScalarExpression, operator: ComparisonOperator, right: ScalarExpression) {
		this.operator = operator;
		this.left = left;
		this.right = right;
	}
}

export type ScalarExpression = Stat | number | 'result' | ScalarOperation;
export type BooleanExpression = boolean | Comparison;
export type Expression = ScalarExpression | BooleanExpression;

export const plus = (a: ScalarExpression, b: ScalarExpression): ScalarOperation =>
	new ScalarOperation(a, '+', b);
export const minus = (a: ScalarExpression, b: ScalarExpression): ScalarOperation =>
	new ScalarOperation(a, '-', b);
export const mult = (a: ScalarExpression, b: ScalarExpression): ScalarOperation =>
	new ScalarOperation(a, '*', b);
export const div = (a: ScalarExpression, b: ScalarExpression): ScalarOperation =>
	new ScalarOperation(a, '/', b);
export const eq = (a: ScalarExpression, b: ScalarExpression): Comparison =>
	new Comparison(a, '=', b);
export const neq = (a: ScalarExpression, b: ScalarExpression): Comparison =>
	new Comparison(a, '!=', b);
export const gt = (a: ScalarExpression, b: ScalarExpression): Comparison =>
	new Comparison(a, '>', b);
export const gte = (a: ScalarExpression, b: ScalarExpression): Comparison =>
	new Comparison(a, '>=', b);
export const lt = (a: ScalarExpression, b: ScalarExpression): Comparison =>
	new Comparison(a, '<', b);
export const lte = (a: ScalarExpression, b: ScalarExpression): Comparison =>
	new Comparison(a, '<=', b);

/**
 * Establishes if the given expression produces scalar values.
 * @param value The expression to evaluate.
 * @returns True if the expression produces a scalar value, false otherwise.
 */
export const isScalarExpression = (value: Expression): value is ScalarExpression =>
	typeof value === 'number' ||
	value instanceof Stat ||
	value === 'result' ||
	value instanceof ScalarOperation;

/**
 * Establishes if the given expression produces boolean values.
 * @param value The expression to evaluate.
 * @returns True if the expression produces a boolean value, false otherwise.
 */
export const isBooleanExpression = (value: Expression): value is BooleanExpression =>
	typeof value === 'boolean' || value instanceof Comparison;

/**
 * Returns 1 if the expression is guaranteed to be singular (the number 1),
 * otherwise returns 2 to indicate potential plurality.
 *
 * This is useful for pluralization where we need to decide between singular
 * and plural forms when the actual value won't be known until runtime.
 */
export const expressionPlurality = (expr: Expression): 1 | 2 => {
	return expr === 1 ? 1 : 2;
};
