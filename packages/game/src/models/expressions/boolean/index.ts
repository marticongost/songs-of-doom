// Base classes
export { BooleanExpression, type BooleanExpressionType } from './boolean-expression';

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
export { is, IsExpression, type IsExpressionProps } from './is';
export { owned, OwnedExpression } from './owned';
export { wounded } from './wounded';

// Helper functions
export { evaluateBoolean } from './functions';
