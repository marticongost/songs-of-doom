import type { Property } from '../properties';
import { BooleanExpression } from './boolean-expression';

/**
 * Props for creating a PropertyExpression.
 */
export interface PropertyExpressionProps {
	/** The properties that the subject must have for this expression to be true. */
	properties: Array<Property>;
}

/**
 * A boolean expression that checks whether the subject has specific properties.
 * The expression evaluates to true only if the subject has all the specified properties.
 */
export class PropertyExpression extends BooleanExpression {
	/** The properties that the subject must have. */
	readonly properties: Array<Property>;

	constructor({ properties }: PropertyExpressionProps) {
		super();
		this.properties = properties;
	}
}
