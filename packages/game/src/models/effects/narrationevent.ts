import type { LocalisedText } from '@songsofdoom/common/localisation';

import { Effect } from './effect';

/**
 * Props for configuring a NarrationEventEffect.
 */
export interface NarrationEventEffectProps {
	/** The narrative text to be read by the players, in multiple languages. */
	text: LocalisedText;
}

/**
 * An effect that prompts the players to read a narrative fragment that advances the story.
 */
export class NarrationEventEffect extends Effect {
	/** The narrative text to be read by the players, in multiple languages. */
	readonly text: LocalisedText;

	constructor({ text }: NarrationEventEffectProps) {
		super();
		this.text = text;
	}
}
