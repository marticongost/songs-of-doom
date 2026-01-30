// Base classes
export { BooleanExpression } from './boolean-expression';
export { Expression } from './expression';
export { ScalarExpression } from './scalar-expression';

// Scalar operations
export {
	div,
	minus,
	mult,
	plus,
	ScalarOperation,
	type ScalarExpressionType,
	type ScalarOperator
} from './scalar-operation';

// Comparisons
export { Comparison, eq, gt, gte, lt, lte, neq, type ComparisonOperator } from './comparison';

// Logical operators
export { And, and, Not, not, Or, or, type BooleanExpressionType } from './logical';

// Boolean expressions
export { engaged, EngagedExpression } from './engaged';
export {
	receivedWounds,
	ReceivedWoundsExpression,
	remainingWounds,
	RemainingWoundsExpression,
	wounded
} from './wounded';

// Scalar expressions
export { distance, DistanceExpression } from './distance';
export { NearbyEnemiesExpression, type NearbyEnemiesExpressionProps } from './nearby-enemies';

// Type guards
import { Property } from '../properties';
import { Stat } from '../stats';
import { BooleanExpression } from './boolean-expression';
import { Comparison } from './comparison';
import type { BooleanExpressionType } from './logical';
import { ScalarExpression } from './scalar-expression';
import type { ScalarExpressionType } from './scalar-operation';
import { ScalarOperation } from './scalar-operation';

/**
 * Establishes if the given expression produces scalar values.
 * @param value The expression to evaluate.
 * @returns True if the expression produces a scalar value, false otherwise.
 */
export const isScalarExpression = (
	value: ScalarExpressionType | BooleanExpressionType
): value is ScalarExpressionType =>
	typeof value === 'number' ||
	value instanceof Stat ||
	value === 'result' ||
	value instanceof ScalarOperation ||
	value instanceof ScalarExpression;

/**
 * Establishes if the given expression produces boolean values.
 * @param value The expression to evaluate.
 * @returns True if the expression produces a boolean value, false otherwise.
 */
export const isBooleanExpression = (
	value: ScalarExpressionType | BooleanExpressionType
): value is BooleanExpressionType =>
	typeof value === 'boolean' ||
	value instanceof Property ||
	value instanceof Comparison ||
	value instanceof BooleanExpression;

/**
 * Returns 1 if the expression is guaranteed to be singular (the number 1),
 * otherwise returns 2 to indicate potential plurality.
 *
 * This is useful for pluralization where we need to decide between singular
 * and plural forms when the actual value won't be known until runtime.
 */
export const expressionPlurality = (expr: ScalarExpressionType | BooleanExpressionType): 1 | 2 => {
	return expr === 1 ? 1 : 2;
};

// Legacy type union for backward compatibility
export type ExpressionType = ScalarExpressionType | BooleanExpressionType;
