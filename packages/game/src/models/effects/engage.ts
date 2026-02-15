import { Effect } from './effect';

/**
 * An effect that allows the player to engage an opponent, pulling them
 * into melee range within the player's threat zone.
 */
export class EngageEffect extends Effect {}

/**
 * Singleton instance for engaging an opponent.
 */
export const engage = new EngageEffect();
