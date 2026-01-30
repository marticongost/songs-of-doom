import { BooleanExpression } from './boolean-expression';
import type { Comparison } from './comparison';
import type { Property } from '../properties';

/**
 * A type union representing all possible boolean expressions.
 * Includes primitives (boolean), comparisons, logical operators, properties, and custom boolean expressions.
 */
export type BooleanExpressionType =
	| boolean
	| Property
	| Comparison
	| And
	| Or
	| Not
	| BooleanExpression;

/**
 * Logical AND operation between two or more boolean expressions.
 * Evaluates to true only if all operands are true.
 */
export class And extends BooleanExpression {
	/**
	 * The boolean expressions to combine with AND logic.
	 */
	readonly operands: Array<BooleanExpressionType>;

	constructor(...operands: Array<BooleanExpressionType>) {
		super();
		this.operands = operands;
	}
}

/**
 * Logical OR operation between two or more boolean expressions.
 * Evaluates to true if at least one operand is true.
 */
export class Or extends BooleanExpression {
	/**
	 * The boolean expressions to combine with OR logic.
	 */
	readonly operands: Array<BooleanExpressionType>;

	constructor(...operands: Array<BooleanExpressionType>) {
		super();
		this.operands = operands;
	}
}

/**
 * Logical NOT operation (negation) of a boolean expression.
 * Evaluates to true if the operand is false, and vice versa.
 */
export class Not extends BooleanExpression {
	/**
	 * The boolean expression to negate.
	 */
	readonly operand: BooleanExpressionType;

	constructor(operand: BooleanExpressionType) {
		super();
		this.operand = operand;
	}
}

// Helper functions for creating logical operations
export const and = (...operands: Array<BooleanExpressionType>): And => new And(...operands);
export const or = (...operands: Array<BooleanExpressionType>): Or => new Or(...operands);
export const not = (operand: BooleanExpressionType): Not => new Not(operand);
