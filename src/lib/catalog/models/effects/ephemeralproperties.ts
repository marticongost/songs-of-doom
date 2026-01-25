import type { Property } from '../properties';
import { Effect, type EffectProps } from './effect';

/**
 * Props for configuring an EphemeralPropertiesEffect.
 */
export interface EphemeralPropertiesEffectProps extends EffectProps {
	/**
	 * The properties that are temporarily granted while another effect is being resolved.
	 * This can include Keywords or scalar rules (e.g., Piercing) that enhance the resolution
	 * of the wrapped effect.
	 */
	grantedProperties: Array<Property>;
}

/**
 * An effect that temporarily applies one or more properties while another effect is being resolved.
 * This allows cards to gain Keywords or increase the value of already possessed scalar rules
 * (e.g., increasing Piercing (2) to Piercing (3)) for the duration of the effect resolution.
 */
export class EphemeralPropertiesEffect extends Effect {
	/**
	 * The properties that are temporarily granted while another effect is being resolved.
	 * This can include Keywords or scalar rules (e.g., Piercing) that enhance the resolution
	 * of the wrapped effect.
	 */
	readonly grantedProperties: Array<Property>;

	constructor({ grantedProperties, properties }: EphemeralPropertiesEffectProps) {
		super({ properties });
		this.grantedProperties = grantedProperties;
	}
}
