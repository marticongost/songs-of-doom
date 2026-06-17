import type { LocalisedText } from '@songsofdoom/common/localisation';

import { Effect } from './effect';

/**
 * Props for configuring a NarrationEffect.
 */
export interface NarrationEffectProps {
	/** The narrative text to be read by the players, in multiple languages. */
	text: LocalisedText;
}

/**
 * An effect that prompts the players to read a narrative fragment that advances the story.
 */
export class NarrationEffect extends Effect {
	/** The narrative text to be read by the players, in multiple languages. */
	readonly text: LocalisedText;

	constructor({ text }: NarrationEffectProps) {
		super();
		this.text = text;
	}
}

/** Creates a narration effect. */
export const narration = (textOrProps: LocalisedText | NarrationEffectProps): NarrationEffect =>
	new NarrationEffect(
		'text' in textOrProps ? (textOrProps as NarrationEffectProps) : { text: textOrProps }
	);
