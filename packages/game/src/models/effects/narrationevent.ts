import type { LocalisedText } from '@songsofdoom/common/localisation';

import type { GameGraph } from '../game/gamegraph';
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

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/** Creates a narration event effect. */
export const narrationEvent = (
	textOrProps: LocalisedText | NarrationEventEffectProps
): NarrationEventEffect =>
	new NarrationEventEffect(
		'text' in textOrProps ? (textOrProps as NarrationEventEffectProps) : { text: textOrProps }
	);
