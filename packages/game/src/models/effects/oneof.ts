import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

/**
 * Props for configuring a OneOfEffect.
 */
export interface OneOfEffectProps {
	/** Each of the available mutually exclusive options. */
	effects: Effect[];
}

/**
 * An effect that lists a number of mutually exclusive effects, of which one occurs.
 */
export class OneOfEffect extends Effect {
	/** Each of the available mutually exclusive options. */
	readonly effects: Effect[];

	constructor({ effects }: OneOfEffectProps) {
		super();
		this.effects = effects;
	}

	override async trigger(_gameGraph: GameGraph) {
		// TODO: prompt the player for the chosen option, and trigger it
	}
}

/** Creates a one-of effect. */
export const oneOf = (effectsOrProps: Effect[] | OneOfEffectProps): OneOfEffect =>
	new OneOfEffect(Array.isArray(effectsOrProps) ? { effects: effectsOrProps } : effectsOrProps);
