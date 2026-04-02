import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

/**
 * An effect that draws and resolves an encounter card.
 */
export class ResolveEncounterEffect extends Effect {
	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<ResolveEncounterEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

/**
 * Creates an effect that draws and resolves an encounter.
 */
export const resolveEncounter = (): ResolveEncounterEffect => new ResolveEncounterEffect();
