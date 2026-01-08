import type { Property } from '../properties';

export interface EffectProps {
	properties?: Array<Property>;
}

export abstract class Effect {
	readonly properties: Array<Property>;

	constructor({ properties }: EffectProps = {}) {
		this.properties = properties ?? [];
	}
}
