export interface DrawCardsEffectProps {
	amount: number;
}

export class DrawCardsEffect {
	readonly amount: number;

	constructor({ amount }: DrawCardsEffectProps) {
		this.amount = amount;
	}
}
