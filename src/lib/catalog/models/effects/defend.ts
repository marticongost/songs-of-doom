import { resolveExpression, type ExpressionNode, type Expression } from '../expression';
import type { Property } from '../properties';
import { Effect } from './effect';

export interface DefendEffectProps {
	expression: Expression;
	properties?: Array<Property>;
}

export class DefendEffect extends Effect {
	readonly expression: ExpressionNode;
	readonly properties: Array<Property>;

	constructor({ expression, properties }: DefendEffectProps) {
		super();
		this.expression = resolveExpression(expression);
		this.properties = properties ?? [];
	}
}
