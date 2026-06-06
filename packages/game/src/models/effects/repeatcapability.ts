import { Effect } from './effect';

/**
 * An effect that allows repeating the current capability.
 */
export class RepeatCapabilityEffect extends Effect {}

/**
 * Creates an effect that allows repeating the current capability.
 */
export const repeatCapability = (): RepeatCapabilityEffect => new RepeatCapabilityEffect();
