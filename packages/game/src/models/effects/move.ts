import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect that allows a character to execute a move action, changing their
 * location to an adjacent, accessible location.
 */
export class MoveEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<MoveEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that moves to an adjacent, accessible location.
 */
export const move = (): MoveEffect => new MoveEffect();
