import { Effect } from './effect';

/**
 * An effect that allows repeating a capability.
 */
export class RepeatCapabilityEffect extends Effect {}

/**
 * Creates an effect that allows repeating a capability.
 */
export const repeatCapability = (): RepeatCapabilityEffect => new RepeatCapabilityEffect();
