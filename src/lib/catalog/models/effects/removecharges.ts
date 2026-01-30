import { finalise } from '$lib/modelling';
import type { ScalarExpressionType } from '../expressions';
import { Target, type TargetProps } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a RemoveChargesEffect.
 */
export interface RemoveChargesEffectProps {
	amount: ScalarExpressionType;
	target: Target | TargetProps;
}

/**
 * An effect that removes charges from a target.
 */
export class RemoveChargesEffect extends Effect {
	readonly amount: ScalarExpressionType;
	readonly target: Target;

	constructor({ amount, target }: RemoveChargesEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target);
	}
}
