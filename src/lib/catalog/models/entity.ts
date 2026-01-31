import type { LocalisedText } from '$lib/localisation';
import { getEntryMetadata } from '..';
import type { Capability } from './capability';
import type { Property } from './properties';
import type { Trait } from './trait';

export interface EntityProps<T> {
	title: LocalisedText;
	description?: LocalisedText;
	properties?: Array<Property>;
	capabilities?: Array<Capability>;
	maxCharges?: number;
	xpCost?: number;
	goldCost?: number;

	/**
	 * The level of this entity variant (1-based; typically between 1 and 3).
	 */
	level?: number;

	/**
	 * The variants of this entity (including this one). Each variant represents an
	 * upgrade over the previous one, which adds new effects, enhances existing ones or
	 * relaxes or removes constraints.
	 */
	variants?: Array<T>;
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

	/**
	 * The level of this entity variant (1-based; typically between 1 and 3).
	 */
	readonly level: number;

	/**
	 * The variants of this entity (including this one). Each variant represents an
	 * upgrade over the previous one, which adds new effects, enhances existing ones or
	 * relaxes or removes constraints.
	 */
	readonly variants: Array<this>;

	abstract readonly type: EntityType;
	abstract readonly archetype: Trait | undefined;

	constructor({
		title,
		description,
		properties,
		capabilities,
		maxCharges,
		xpCost,
		goldCost,
		level,
		variants
	}: EntityProps<Entity>) {
		this.title = title;
		this.description = description;
		this.explicitProperties = properties ?? [];
		this.capabilities = capabilities ?? [];
		this.maxCharges = maxCharges ?? 0;
		this.xpCost = xpCost;
		this.goldCost = goldCost;
		this.level = level ?? 1;
		this.variants = (variants ?? [this]) as Array<this>;
	}

	get id() {
		return getEntryMetadata(this).id;
	}

	get variantId() {
		return getEntryMetadata(this).variantId;
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

	/**
	 * Get the basic variant of this entity (level 1).
	 */
	get basicVariant(): this {
		return this.variants[0];
	}

	/**
	 * Get the next variant of this entity, if any.
	 */
	get nextVariant(): this | undefined {
		return this.variants.length > this.level ? this.variants[this.level] : undefined;
	}

	/**
	 * Get the previous variant of this entity, if any.
	 */
	get previousVariant(): this | undefined {
		return this.level > 1 ? this.variants[this.level - 2] : undefined;
	}
}
