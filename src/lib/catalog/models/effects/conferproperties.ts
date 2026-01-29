import type { Property } from '../properties';
import { Effect } from './effect';

/**
 * Props for configuring a ConferPropertiesEffect.
 */
export interface ConferPropertiesEffectProps {
	/**
	 * The properties that are granted while the effect lasts.
	 */
	properties: Array<Property>;
}

/**
 * An effect that applies one or more properties while active. This allows cards to gain
 * Keywords or increase the value of already possessed scalar rules (e.g., increasing
 * Piercing (2) to Piercing (3)) for the duration.
 */
export class ConferPropertiesEffect extends Effect {
	/**
	 * The properties that are granted while the effect lasts.
	 */
	readonly properties: Array<Property>;

	constructor({ properties }: ConferPropertiesEffectProps) {
		super();
		this.properties = properties;
	}
}
