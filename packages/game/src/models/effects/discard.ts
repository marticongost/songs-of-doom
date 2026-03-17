import { Effect } from './effect';

/**
 * An effect that discards the card triggering the effect.
 */
export class DiscardEffect extends Effect {}

/**
 * Creates an effect that discards the card triggering the effect.
 */
export const discard = (): DiscardEffect => new DiscardEffect();
