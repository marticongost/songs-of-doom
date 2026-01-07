import type { LocalisedText } from '$lib/localisation';
import { getEntryMetadata } from '..';
import type { Capability } from './capability';
import type { Property } from './properties';
import type { Trait } from './trait';

export interface EntityProps {
	title: LocalisedText;
	description?: LocalisedText;
	properties?: Array<Property>;
	capabilities?: Array<Capability>;
	maxCharges?: number;
}

export abstract class Entity {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;
	readonly properties: Array<Property>;
	readonly capabilities: Array<Capability>;
	readonly maxCharges: number;

	abstract readonly archetype: Trait | undefined;

	constructor({ title, description, properties, capabilities, maxCharges }: EntityProps) {
		this.title = title;
		this.description = description;
		this.properties = properties ?? [];
		this.capabilities = capabilities ?? [];
		this.maxCharges = maxCharges ?? 0;
	}

	get id() {
		return getEntryMetadata(this).id;
	}

	get isArchetype(): boolean {
		return false;
	}
}
