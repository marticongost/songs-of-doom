import type { ScalarExpressionType } from './scalar-expression';

/**
 * Returns 1 if the expression is guaranteed to be singular (the number 1),
 * otherwise returns 2 to indicate potential plurality.
 *
 * This is useful for pluralization where we need to decide between singular
 * and plural forms when the actual value won't be known until runtime.
 */
export const expressionPlurality = (expr: ScalarExpressionType): 1 | 2 => {
	return expr === 1 ? 1 : 2;
};
