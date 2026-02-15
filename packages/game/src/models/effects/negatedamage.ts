import { Effect } from './effect';

/**
 * An effect that completely negates all damage from an attack, reducing it to zero.
 * This effect cancels any incoming damage before it is applied.
 */
export class NegateDamageEffect extends Effect {}

/**
 * Singleton instance for negating damage.
 */
export const negateDamage = new NegateDamageEffect();
