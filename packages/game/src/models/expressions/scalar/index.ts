// Base classes
import { type ScalarExpressionType } from './scalar-expression';
export { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

// Scalar operations
export { result, ResultExpression } from './result-expression';
export { div, minus, mult, plus, ScalarOperation, type ScalarOperator } from './scalar-operation';

// Scalar expressions
export { cash, CashExpression } from './cash';
export { charges, ChargesExpression, type ChargesExpressionProps } from './charges';
export { count, CountExpression, type CountExpressionProps } from './count';
export { distance, DistanceExpression } from './distance';
export { effectiveDefense, EffectiveDefenseExpression } from './effective-defense';
export { handSize, HandSizeExpression } from './hand-size';
export {
	TALENT_PROFICIENCY_PENALTY,
	talentProficiency,
	TalentProficiencyExpression,
	type TalentProficiencyExpressionProps
} from './talent-proficiency';

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
