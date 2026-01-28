import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';
import { Effect } from './effect';

export type RechargeAmount = number | 'max';

export interface RechargeEffectProps {
	amount: RechargeAmount;
	target?: Target | TargetProps;
}

export class RechargeEffect extends Effect {
	readonly amount: RechargeAmount;
	readonly target: Target;

	constructor({ amount, target }: RechargeEffectProps) {
		super();
		this.amount = amount;
		this.target = finalise(Target, target ?? 'self');
	}
}
