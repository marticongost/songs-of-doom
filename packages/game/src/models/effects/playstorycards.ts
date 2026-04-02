import { Story } from '../entities/story';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * Props for configuring a PlayStoryCardsEffect.
 */
export interface PlayStoryCardsEffectProps {
	/** The story cards to put in play. */
	cards: Story[];
}

/**
 * An effect that puts one or more story cards in play.
 */
export class PlayStoryCardsEffect extends Effect {
	/** The story cards to put in play. */
	readonly cards: Story[];

	constructor({ cards }: PlayStoryCardsEffectProps) {
		super();
		this.cards = cards;
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<PlayStoryCardsEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/** Creates a play story cards effect. */
export const playStoryCards = (
	cardsOrProps: Story[] | PlayStoryCardsEffectProps
): PlayStoryCardsEffect =>
	new PlayStoryCardsEffect(Array.isArray(cardsOrProps) ? { cards: cardsOrProps } : cardsOrProps);
