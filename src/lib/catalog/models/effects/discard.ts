import { Effect } from './effect';

/**
 * An effect that discards the card triggering the effect.
 */
export class DiscardEffect extends Effect {}

/**
 * Singleton instance for discarding the card triggering the effect.
 */
export const discard = new DiscardEffect();
