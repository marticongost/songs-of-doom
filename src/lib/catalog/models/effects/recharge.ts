import { Effect, type EffectProps } from './effect';

export type RechargeAmount = number | 'max';

export interface RechargeEffectProps extends EffectProps {
	amount: RechargeAmount;
}

export class RechargeEffect extends Effect {
	readonly amount: RechargeAmount;

	constructor({ amount, properties }: RechargeEffectProps) {
		super({ properties });
		this.amount = amount;
	}
}
