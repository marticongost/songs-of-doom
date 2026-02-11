import { Effect } from './effect';

/**
 * An effect that causes the player to discard the current encounter and draw a new one.
 */
export class ReplaceEncounterEffect extends Effect {}

/**
 * Singleton instance for replacing an encounter.
 */
export const replaceEncounter = new ReplaceEncounterEffect();
