import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect primarily used by enemies to pursue their designated prey.
 * When triggered, the creature moves towards its prey's location.
 * If already at the same location as the prey, the creature engages it instead.
 */
export class ChaseEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<ChaseEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that chases the prey.
 */
export const chase = (): ChaseEffect => new ChaseEffect();
