import { Effect } from './effect';

/**
 * An effect that allows a player to discard a drawn fate token and draw a new one instead.
 * This is used after drawing fate tokens to determine the outcome of a test, giving the player
 * a chance to potentially get a better result.
 */
export class RedrawFateEffect extends Effect {}
