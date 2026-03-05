import { Effect } from './effect';

/**
 * An effect that allows a character to execute a move action, changing their
 * location to an adjacent, accessible location.
 */
export class MoveEffect extends Effect {}

/**
 * Singleton instance for moving to an adjacent, accessible location.
 */
export const move = new MoveEffect();
