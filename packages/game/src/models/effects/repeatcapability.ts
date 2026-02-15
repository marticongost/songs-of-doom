import { Effect } from './effect';

/**
 * An effect that allows repeating a capability.
 */
export class RepeatCapabilityEffect extends Effect {}

/**
 * Singleton instance for repeating a capability.
 */
export const repeatCapability = new RepeatCapabilityEffect();
