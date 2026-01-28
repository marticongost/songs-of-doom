import { Effect } from './effect';

export interface DrawCardsEffectProps {
	amount: number;
}

export class DrawCardsEffect extends Effect {
	readonly amount: number;

	constructor({ amount }: DrawCardsEffectProps) {
		super();
		this.amount = amount;
	}
}
