import type { LocalisedText } from '$lib/localisation';
import { getEntryMetadata } from '..';
import type { Capability } from './capability';
import type { Property } from './properties';
import type { Trait } from './trait';

export interface CardProps {
	title: LocalisedText;
	description?: LocalisedText;
	properties?: Array<Property>;
	capabilities?: Array<Capability>;
}

export abstract class Card {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;
	readonly properties: Array<Property>;
	readonly capabilities: Array<Capability>;

	abstract readonly archetype: Trait | undefined;

	constructor({ title, description, properties, capabilities }: CardProps) {
		this.title = title;
		this.description = description;
		this.properties = properties ?? [];
		this.capabilities = capabilities ?? [];
	}

	get id() {
		return getEntryMetadata(this).id;
	}
}
