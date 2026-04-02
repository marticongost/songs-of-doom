import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect that causes the player to discard the current encounter and draw a new one.
 */
export class ReplaceEncounterEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<ReplaceEncounterEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that replaces the current encounter.
 */
export const replaceEncounter = (): ReplaceEncounterEffect => new ReplaceEncounterEffect();
