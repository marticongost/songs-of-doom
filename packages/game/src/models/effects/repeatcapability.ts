import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect that allows repeating a capability.
 */
export class RepeatCapabilityEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<RepeatCapabilityEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that allows repeating a capability.
 */
export const repeatCapability = (): RepeatCapabilityEffect => new RepeatCapabilityEffect();
