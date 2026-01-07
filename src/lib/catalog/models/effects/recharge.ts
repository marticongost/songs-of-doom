import { Effect } from './effect';

export type RechargeAmount = number | 'max';

export interface RechargeEffectProps {
	amount: RechargeAmount;
}

export class RechargeEffect extends Effect {
	readonly amount: RechargeAmount;

	constructor({ amount }: RechargeEffectProps) {
		super();
		this.amount = amount;
	}
}
