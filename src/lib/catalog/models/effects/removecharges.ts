import { finalise } from '$lib/modelling';
import { resolveExpression, type Expression, type ExpressionNode } from '../expression';
import { Target, type TargetProps } from '../target';
import { Effect, type EffectProps } from './effect';

/**
 * Props for configuring a RemoveChargesEffect.
 */
export interface RemoveChargesEffectProps extends EffectProps {
	amount: Expression;
	target: Target | TargetProps;
}

/**
 * An effect that removes charges from a target.
 */
export class RemoveChargesEffect extends Effect {
	readonly amount: ExpressionNode;
	readonly target: Target;

	constructor({ amount, target, properties }: RemoveChargesEffectProps) {
		super({ properties });
		this.amount = resolveExpression(amount);
		this.target = finalise(Target, target);
	}
}
