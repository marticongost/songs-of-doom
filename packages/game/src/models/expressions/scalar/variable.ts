import { ScalarExpression } from './scalar-expression';

/**
 * Props for creating a VariableExpression.
 */
export interface VariableExpressionProps {
	/** The name of the variable to reference. */
	name: string;
}

/**
 * A scalar expression that references a named variable.
 * Rendered using the Variable component to visually distinguish it from other values.
 *
 * Examples:
 * - `variable('X')` - reference a variable named X
 * - `lte(distance, variable('X'))` - distance is at most X
 */
export class VariableExpression extends ScalarExpression {
	/** The name of the variable. */
	readonly name: string;

	constructor({ name }: VariableExpressionProps) {
		super();
		this.name = name;
	}
}

/**
 * Creates a VariableExpression referencing the given variable name.
 *
 * @param name - The name of the variable to reference.
 * @returns A VariableExpression for the given name.
 *
 * @example
 * // Reference a variable named X
 * variable('X')
 *
 * @example
 * // Use in a comparison: distance ≤ X
 * lte(distance, variable('X'))
 */
export function variable(name: string): VariableExpression {
	return new VariableExpression({ name });
}

/** A singleton variable representing "X". */
export const X = variable('X');
