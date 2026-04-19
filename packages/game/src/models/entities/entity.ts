import type { LocalisedText } from '@songsofdoom/common/localisation';
import { standard } from '../../data/properties';
import { getEntryMetadata } from '../../entry-metadata';
import type { Capability } from '../capability';
import type { Effect } from '../effects';
import type { Property } from '../properties';
import type { EntityType } from '../properties/entitytypes';
import type { Ally } from './ally';
import { type Archetype } from './archetype';
import type { Campaign } from './campaign';
import type { Creature } from './creature';
import { type Discipline } from './discipline';
import type { Encounter } from './encounter';
import type { Item } from './item';
import type { Location } from './location';
import type { Module } from './module';
import type { Scenario } from './scenario';
import type { Skill } from './skill';
import type { Story } from './story';
import type { Trait } from './trait';

export interface EntityProps<T> {
	title: LocalisedText;
	description?: LocalisedText;
	properties?: Array<Property>;
	capabilities?: Array<Capability>;
	attachmentCapabilities?: Array<Capability>;
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

export abstract class Entity {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;
	readonly reactionOrder: number = 0;
	protected readonly explicitProperties: Array<Property>;
	readonly capabilities: Array<Capability>;
	readonly attachmentCapabilities: Array<Capability>;
	readonly maxCharges: number;
	readonly xpCost?: number;
	readonly goldCost?: number;

	/** The maximum number of copies of this entity that a player can acquire, or
	 * `undefined` it unlimited or not applicable. */
	readonly maxCopies: number | undefined = undefined;

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

	abstract readonly set: ParentEntity | undefined;
	abstract readonly type: EntityType;

	constructor({
		title,
		description,
		properties,
		capabilities,
		attachmentCapabilities,
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
		this.attachmentCapabilities = attachmentCapabilities ?? [];
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

	get properties(): Array<Property> {
		return [this.type, ...this.explicitProperties];
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

	/** An entity that must be possessed in order to acquire this entity. */
	get requiredEntity(): Entity | undefined {
		return this.requiredArchetype || this.requiredDiscipline;
	}

	/** An archetype that must be possessed in order to acquire this entity. */
	get requiredArchetype(): Archetype | undefined {
		return undefined;
	}

	/** A discipline that must be possessed in order to acquire this entity. */
	get requiredDiscipline(): Discipline | undefined {
		return undefined;
	}

	/** Lists all permanent effects provided by this entity's capabilities. */
	permanentEffects(): Array<Effect> {
		return [];
	}

	/** Whether this entity is a standard one that all characters start with. */
	isStandard(): boolean {
		return this.properties.includes(standard);
	}
}

const NOT_COMPUTED = Symbol('not computed');

export abstract class ChildEntity<C extends ParentEntity> extends Entity {
	private _parent: C | typeof NOT_COMPUTED = NOT_COMPUTED;

	override get set(): C {
		return this.parent;
	}

	override get requiredArchetype(): Archetype | undefined {
		const parent = this.parent;
		return isArchetype(parent) ? parent : parent?.requiredArchetype;
	}

	override get requiredDiscipline(): Discipline | undefined {
		const parent = this.parent;
		return isDiscipline(parent) ? parent : parent?.requiredDiscipline;
	}

	get parent(): C {
		if (this._parent === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			if (metadata.path.length >= 2) {
				const parentId = metadata.qualifiedPaths
					? metadata.path.slice(0, -1).join('-')
					: metadata.path[metadata.path.length - 2];
				return (this._parent = metadata.catalog.require(parentId) as C);
			}
			throw new Error(`${this.constructor.name} ${this.id} is not inside a parent`);
		}
		return this._parent;
	}
}

export abstract class ParentEntity extends Entity {
	private _parent: this | undefined | typeof NOT_COMPUTED = NOT_COMPUTED;
	private _children: Array<ChildEntity<this>> | undefined = undefined;

	constructor(props: EntityProps<ParentEntity>) {
		super(props);
		this._children = undefined;
	}

	override get set(): this {
		return this;
	}

	get parent(): this | undefined {
		if (this._parent === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			if (metadata.path.length >= 3) {
				const archetypeId = metadata.path[metadata.path.length - 3];
				return (this._parent = metadata.catalog.require(archetypeId) as this);
			}
			return (this._parent = undefined);
		}
		return this._parent;
	}

	get children(): Array<ChildEntity<this>> {
		if (this._children === undefined) {
			this._children = getEntryMetadata(this)
				.catalog.all()
				.filter((entity) => entity instanceof ChildEntity && entity.parent === this) as Array<
				ChildEntity<this>
			>;
		}
		return this._children;
	}

	getChildrenOfType(type: EntityType): Array<Entity> {
		return this.children.filter((child) => child.type === type);
	}
}

export const isArchetype = (entity: Entity): entity is Archetype => {
	return entity.type.id === 'archetype';
};

export const isDiscipline = (entity: Entity): entity is Discipline => {
	return entity.type.id === 'discipline';
};

export const isTrait = (entity: Entity): entity is Trait => {
	return entity.type.id === 'trait';
};

export const isSkill = (entity: Entity): entity is Skill => {
	return entity.type.id === 'skill';
};

export const isItem = (entity: Entity): entity is Item => {
	return entity.type.id === 'item';
};

export const isCreature = (entity: Entity): entity is Creature => {
	return entity.type.id === 'creature';
};

export const isAlly = (entity: Entity): entity is Ally => {
	return entity.type.id === 'ally';
};

export const isEncounter = (entity: Entity): entity is Encounter => {
	return entity.type.id === 'encounter';
};

export const isModule = (entity: Entity): entity is Module => {
	return entity.type.id === 'module';
};

export const isCampaign = (entity: Entity): entity is Campaign => {
	return entity.type.id === 'campaign';
};

export const isScenario = (entity: Entity): entity is Scenario => {
	return entity.type.id === 'scenario';
};

export const isStory = (entity: Entity): entity is Story => {
	return entity.type.id === 'story';
};

export const isLocation = (entity: Entity): entity is Location => {
	return entity.type.id === 'location';
};
