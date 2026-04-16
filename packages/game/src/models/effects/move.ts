import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

/**
 * An effect that allows a character to execute a move action, changing their
 * location to an adjacent, accessible location.
 */
export class MoveEffect extends Effect {
	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/**
 * Creates an effect that moves to an adjacent, accessible location.
 */
export const move = (): MoveEffect => new MoveEffect();
