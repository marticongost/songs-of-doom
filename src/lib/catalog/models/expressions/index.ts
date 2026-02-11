// Base classes
import { type BooleanExpressionType } from './boolean-expression';
import { type ScalarExpressionType } from './scalar-expression';
export { BooleanExpression, type BooleanExpressionType } from './boolean-expression';
export { Expression } from './expression';
export { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

// Scalar operations
export { result, ResultExpression } from './result-expression';
export { div, minus, mult, plus, ScalarOperation, type ScalarOperator } from './scalar-operation';

// Comparisons
export {
	ComparisonExpression,
	eq,
	gt,
	gte,
	lt,
	lte,
	neq,
	type ComparisonOperator
} from './comparison';

// Logical operators
export { and, AndExpression, not, NotExpression, or, OrExpression } from './logical';

// Boolean expressions
export { copyAlreadyAttached, CopyAlreadyAttachedExpression } from './copy-already-attached';
export { engaged, EngagedExpression } from './engaged';
export { owned, OwnedExpression } from './owned';
export {
	receivedWounds,
	ReceivedWoundsExpression,
	remainingWounds,
	RemainingWoundsExpression,
	wounded
} from './wounded';

// Scalar expressions
export { charges, ChargesExpression, type ChargesExpressionProps } from './charges';
export { count, CountExpression, type CountExpressionProps } from './count';
export { distance, DistanceExpression } from './distance';
export { effectiveDefense, EffectiveDefenseExpression } from './effective-defense';
export { handSize, HandSizeExpression } from './hand-size';

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
