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

	/*
	override async apply(gameGraph: GameGraph) {
		await gameGraph.mutate((state) => {
			const player = state.requireActivePlayer();
			const drawnCards = player.drawFromDeck(state, this.amount);
			return { cards: (Array.isArray(drawnCards) ? drawnCards : []).map((card) => card.id) };
		});
	}
	*/
}

/** Creates an effect that draws cards. */
export const drawCards = (amountOrProps: number | DrawCardsEffectProps): DrawCardsEffect =>
	new DrawCardsEffect(
		typeof amountOrProps === 'number' ? { amount: amountOrProps } : amountOrProps
	);
