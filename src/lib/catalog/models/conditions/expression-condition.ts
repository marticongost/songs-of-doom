import type { BooleanExpression } from '../expression';
import { Condition } from './condition';

/**
 * Props for creating an ExpressionCondition.
 */
export interface ExpressionConditionProps {
	/** The boolean expression that must evaluate to true for the condition to be satisfied. */
	expression: BooleanExpression;
}

/**
 * A condition that is satisfied if a given boolean expression evaluates to true.
 * This allows for dynamic, expression-based conditions using comparisons and other boolean logic.
 */
export class ExpressionCondition extends Condition {
	/** The boolean expression that must evaluate to true for the condition to be satisfied. */
	readonly expression: BooleanExpression;

	constructor({ expression }: ExpressionConditionProps) {
		super();
		this.expression = expression;
	}
}
