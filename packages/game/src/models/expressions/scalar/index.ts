// Base classes
export { ScalarExpression, type ScalarExpressionType } from './scalar-expression';

// Scalar operations
export { proficiency, ProficiencyExpression } from './proficiency';
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
export { variable, VariableExpression, X, type VariableExpressionProps } from './variable';

// Helper functions
export { expressionPlurality } from './functions';
