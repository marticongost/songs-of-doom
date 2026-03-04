import { Effect } from './effect';

/**
 * An effect that prevents a character from taking movement actions.
 */
export class ImmobilizeEffect extends Effect {}

/**
 * Singleton instance for immobilizing a character.
 */
export const immobilize = new ImmobilizeEffect();
