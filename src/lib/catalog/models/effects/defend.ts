import { resolveExpression, type StatExpression, type StatExpressionNode } from '../expression';
import { Effect, type EffectProps } from './effect';

export interface DefendEffectProps extends EffectProps {
	expression: StatExpression;
}

export class DefendEffect extends Effect {
	readonly expression: StatExpressionNode;

	constructor({ expression, properties }: DefendEffectProps) {
		super({ properties });
		this.expression = resolveExpression(expression);
	}
}
