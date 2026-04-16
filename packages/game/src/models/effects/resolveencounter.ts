import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

/**
 * An effect that draws and resolves an encounter card.
 */
export class ResolveEncounterEffect extends Effect {
	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/**
 * Creates an effect that draws and resolves an encounter.
 */
export const resolveEncounter = (): ResolveEncounterEffect => new ResolveEncounterEffect();
