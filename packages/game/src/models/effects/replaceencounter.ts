import { Effect } from './effect';

/**
 * An effect that causes the player to discard the current encounter and draw a new one.
 */
export class ReplaceEncounterEffect extends Effect {}

/**
 * Creates an effect that replaces the current encounter.
 */
export const replaceEncounter = (): ReplaceEncounterEffect => new ReplaceEncounterEffect();
