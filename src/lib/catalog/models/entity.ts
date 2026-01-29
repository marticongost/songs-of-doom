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
	xpCost?: number;
	goldCost?: number;
}

export type EntityType = 'archetype' | 'trait' | 'skill' | 'ally' | 'item' | 'creature';

export abstract class Entity {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;
	protected readonly explicitProperties: Array<Property>;
	readonly capabilities: Array<Capability>;
	readonly maxCharges: number;
	readonly xpCost?: number;
	readonly goldCost?: number;

	abstract readonly type: EntityType;
	abstract readonly archetype: Trait | undefined;

	constructor({
		title,
		description,
		properties,
		capabilities,
		maxCharges,
		xpCost,
		goldCost
	}: EntityProps) {
		this.title = title;
		this.description = description;
		this.explicitProperties = properties ?? [];
		this.capabilities = capabilities ?? [];
		this.maxCharges = maxCharges ?? 0;
		this.xpCost = xpCost;
		this.goldCost = goldCost;
	}

	get id() {
		return getEntryMetadata(this).id;
	}

	get isArchetype(): boolean {
		return false;
	}

	get properties(): Array<Property> {
		return [...this.getImplicitProperties(), ...this.explicitProperties];
	}

	protected getImplicitProperties(): Array<Property> {
		return [];
	}
}
