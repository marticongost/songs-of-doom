import type { LocalisedText } from '$lib/localisation';
import { BooleanExpression, type BooleanExpressionType } from './boolean-expression';
import { Expression } from './expression';

/**
 * Logical AND operation between two or more boolean expressions.
 * Evaluates to true only if all operands are true.
 */
export class AndExpression extends BooleanExpression {
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
export class OrExpression extends BooleanExpression {
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
export class NotExpression extends BooleanExpression {
	/**
	 * The boolean expression to negate.
	 */
	readonly operand: BooleanExpressionType;

	constructor(operand: BooleanExpressionType) {
		super();
		this.operand = operand;
	}

	translate(): LocalisedText | undefined {
		const text = this.operand instanceof Expression ? this.operand.translate() : undefined;
		if (text) {
			const negatedText: LocalisedText = {};
			for (const [locale, value] of Object.entries(text)) {
				if (locale === 'ca' || locale === 'es') {
					negatedText[locale] = `No ${value.toLowerCase()}`;
				} else if (locale === 'en') {
					negatedText[locale] = `Not ${value.toLowerCase()}`;
				}
			}
			return negatedText;
		}
		return undefined;
	}
}

// Helper functions for creating logical operations
export const and = (...operands: Array<BooleanExpressionType>): AndExpression =>
	new AndExpression(...operands);
export const or = (...operands: Array<BooleanExpressionType>): OrExpression =>
	new OrExpression(...operands);
export const not = (operand: BooleanExpressionType): NotExpression => new NotExpression(operand);
