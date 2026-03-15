import { Story } from '../entities/story';
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
}
