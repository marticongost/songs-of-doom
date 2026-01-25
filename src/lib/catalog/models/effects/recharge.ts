import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';
import { Effect, type EffectProps } from './effect';

export type RechargeAmount = number | 'max';

export interface RechargeEffectProps extends EffectProps {
	amount: RechargeAmount;
	target?: Target | TargetProps;
}

export class RechargeEffect extends Effect {
	readonly amount: RechargeAmount;
	readonly target: Target;

	constructor({ amount, target, properties }: RechargeEffectProps) {
		super({ properties });
		this.amount = amount;
		this.target = finalise(Target, target ?? 'self');
	}
}
