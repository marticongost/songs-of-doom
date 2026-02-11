import { Effect } from './effect';

/**
 * An effect that draws and resolves an encounter card.
 */
export class ResolveEncounterEffect extends Effect {}

/**
 * Singleton instance for resolving an encounter.
 */
export const resolveEncounter = new ResolveEncounterEffect();
