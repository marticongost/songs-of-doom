import { finalise } from '$lib/modelling';
import type { Expression } from '../expression';
import { Target, type TargetProps } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a RemoveChargesEffect.
 */
export interface RemoveChargesEffectProps {
	amount: Expression;
	target: Target | TargetProps;
}

/**
 * An effect that removes charges from a target.
 */
export class RemoveChargesEffect extends Effect {
	readonly amount: Expression;
	readonly target: Target;

	constructor({ amount, target }: RemoveChargesEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}
}
