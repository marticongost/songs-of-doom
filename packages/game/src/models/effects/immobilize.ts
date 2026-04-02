import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect that prevents a character from taking movement actions.
 */
export class ImmobilizeEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<ImmobilizeEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that immobilizes a character.
 */
export const immobilize = (): ImmobilizeEffect => new ImmobilizeEffect();
