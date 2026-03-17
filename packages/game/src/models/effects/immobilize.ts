import { Effect } from './effect';

/**
 * An effect that prevents a character from taking movement actions.
 */
export class ImmobilizeEffect extends Effect {}

/**
 * Creates an effect that immobilizes a character.
 */
export const immobilize = (): ImmobilizeEffect => new ImmobilizeEffect();
