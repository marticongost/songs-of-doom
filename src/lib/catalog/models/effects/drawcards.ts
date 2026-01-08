import { Effect, type EffectProps } from './effect';

export interface DrawCardsEffectProps extends EffectProps {
	amount: number;
}

export class DrawCardsEffect extends Effect {
	readonly amount: number;

	constructor({ amount, properties }: DrawCardsEffectProps) {
		super({ properties });
		this.amount = amount;
	}
}
