import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect that allows the player to engage an opponent, pulling them
 * into melee range within the player's threat zone.
 */
export class EngageEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<EngageEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that engages an opponent.
 */
export const engage = (): EngageEffect => new EngageEffect();
