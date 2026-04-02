import type { GameGraph } from '../game/gamegraph';
import { EffectWithOutcome } from './effect';

export interface DrawCardsEffectProps {
	amount: number;
}

export interface DrawCardsOutcome {
	/** The cards that were drawn. */
	readonly cards: number[];
}

export class DrawCardsEffect extends EffectWithOutcome<DrawCardsOutcome> {
	readonly amount: number;

	constructor({ amount }: DrawCardsEffectProps) {
		super();
		this.amount = amount;
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<DrawCardsEffect>(this, (state) => {
			const player = state.requireActivePlayer();
			const drawnCards = player.drawFromDeck(state, this.amount);
			return { cards: drawnCards.map((card) => card.id) };
		});
	}
}

/** Creates an effect that draws cards. */
export const drawCards = (amountOrProps: number | DrawCardsEffectProps): DrawCardsEffect =>
	new DrawCardsEffect(
		typeof amountOrProps === 'number' ? { amount: amountOrProps } : amountOrProps
	);
