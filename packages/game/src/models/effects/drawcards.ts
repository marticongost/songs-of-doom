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

/** Creates an effect that draws cards. */
export const drawCards = (amountOrProps: number | DrawCardsEffectProps): DrawCardsEffect =>
	new DrawCardsEffect(
		typeof amountOrProps === 'number' ? { amount: amountOrProps } : amountOrProps
	);
