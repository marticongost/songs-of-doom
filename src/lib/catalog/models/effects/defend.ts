import { resolveExpression, type ExpressionNode, type StatExpression } from '../expression';
import { Effect, type EffectProps } from './effect';

export interface DefendEffectProps extends EffectProps {
	expression: StatExpression;
}

export class DefendEffect extends Effect {
	readonly expression: ExpressionNode;

	constructor({ expression, properties }: DefendEffectProps) {
		super({ properties });
		this.expression = resolveExpression(expression);
	}
}
