import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

/**
 * An effect that allows repeating a capability.
 */
export class RepeatCapabilityEffect extends Effect {
	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/**
 * Creates an effect that allows repeating a capability.
 */
export const repeatCapability = (): RepeatCapabilityEffect => new RepeatCapabilityEffect();
