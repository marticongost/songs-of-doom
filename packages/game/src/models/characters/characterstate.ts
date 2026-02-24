import { entities } from '../../catalog';
import { innate } from '../../data/properties';
import { Ally } from '../ally';
import { Archetype } from '../archetype';
import type { Entity } from '../entity';
import { FOCUS_TOKENS_FOR_STAT_VALUES, focuses, type Focus, type FocusType } from '../focus';
import { Item } from '../inventory';
import { Skill } from '../skill';
import { attributes, stats, type Stat, type StatType } from '../stats';
import { Trait } from '../trait';
import {
	ArchetypeRequiredImpediment,
	InnateTraitImpediment,
	InsufficientExperienceImpediment,
	LimitReachedImpediment,
	type EntityAcquisitionImpediment
} from './entityacquisitionimpediments';

export const STARTING_GOLD = 10;
export const STARTING_EXPERIENCE = 10;

/** Parameters for the {@link CharacterState} constructor. */
export interface CharacterStateProps {
	/** Indicates whether the character has been finalised (i.e. the character creation
	 * process has been completed).
	 */
	finalised: boolean;

	/** The number of copies of each upgrade the character has acquired. */
	upgrades: Record<string, number> | Map<Entity, number>;

	/** The number of copies of each skill in the character's deck. */
	skillsDeck: Record<string, number> | Map<Skill, number>;

	/** The amount of experience points the character currently has available to spend. */
	availableXp: number;

	/** The amount of gold the character currently has. */
	gold: number;
}

export class CharacterState {
	/** Indicates whether the character has been finalised (i.e. the character creation
	 * process has been completed).
	 */
	readonly finalised: boolean;

	/** The number of copies of each upgrade the character has acquired. */
	readonly upgrades: Map<Entity, number>;

	/** The number of copies of each skill in the character's deck. */
	readonly skillsDeck: Map<Skill, number>;

	/** The amount of experience points the character currently has available to spend. */
	readonly availableXp: number;

	/** The amount of gold the character currently has. */
	readonly gold: number;

	/** The number of skill cards the character's deck should have. */
	readonly skillDeckSize = 20;

	constructor({ finalised, upgrades, skillsDeck, availableXp, gold }: CharacterStateProps) {
		this.finalised = finalised;
		this.upgrades = CharacterState.normaliseUpgrades(upgrades);
		this.skillsDeck = CharacterState.normaliseSkillDeck(skillsDeck);
		this.availableXp = availableXp;
		this.gold = gold;
	}

	public static initial(): CharacterState {
		return new CharacterState({
			finalised: false,
			upgrades: {},
			skillsDeck: {},
			availableXp: STARTING_EXPERIENCE,
			gold: STARTING_GOLD
		});
	}

	public getNumberOfOwnedCopies(entity: Entity | string): number {
		if (typeof entity === 'string') {
			entity = entities.require(entity);
		}
		if (entity instanceof Skill) {
			return this.skillsDeck.get(entity) ?? 0;
		}
		if (entity.isStandard()) {
			return 1;
		}
		if (this.upgrades.has(entity)) {
			return this.upgrades.get(entity) ? 1 : 0;
		}
		// TODO: inventory
		return 0;
	}

	public getEntityAcquisitionImpediment(
		entity: Entity | string
	): EntityAcquisitionImpediment | undefined {
		if (typeof entity === 'string') {
			entity = entities.require(entity);
		}
		if (
			entity.requiredArchetype &&
			!entity.requiredArchetype.isStandard() &&
			!this.hasUpgrade(entity.requiredArchetype)
		) {
			return new ArchetypeRequiredImpediment(entity.requiredArchetype);
		}
		if (this.availableXp < (entity.xpCost ?? 0)) {
			return new InsufficientExperienceImpediment(entity.xpCost ?? 0);
		}
		if (entity.maxCopies !== undefined && (this.upgrades.get(entity) || 0) >= entity.maxCopies) {
			return new LimitReachedImpediment(entity.maxCopies);
		}
		if (this.finalised && entity.properties.includes(innate)) {
			return new InnateTraitImpediment();
		}
		return undefined;
	}

	public hasUpgrade(entity: Entity | string): boolean {
		if (typeof entity === 'string') {
			entity = entities.require(entity);
		}
		return this.upgrades.has(entity);
	}

	public ownedEntities(): Array<Entity> {
		const standardEntities = entities.all().filter((entity) => entity.isStandard());
		return [
			...standardEntities,
			...Array.from(this.upgrades.entries())
				.filter(([_, copies]) => copies > 0)
				.map(([entity, _]) => entity)
		];
	}

	public archetypes(): Array<Archetype> {
		return this.ownedEntities().filter((entity) => entity instanceof Archetype);
	}

	public traits(): Array<Trait> {
		return this.ownedEntities().filter((entity) => entity instanceof Trait);
	}

	public skills(): Array<Skill> {
		return [...this.skillsDeck.keys()];
	}

	public allies(): Array<Ally> {
		return this.ownedEntities().filter((entity) => entity instanceof Ally);
	}

	public items(): Array<Item> {
		return this.ownedEntities().filter((entity) => entity instanceof Item);
	}

	public acquireEntity(entity: Entity): CharacterState {
		const acquisitionImpediment = this.getEntityAcquisitionImpediment(entity);
		if (acquisitionImpediment) return this;

		const newUpgrades = new Map(this.upgrades);
		if (entity.xpCost || entity.goldCost || entity instanceof Ally || entity instanceof Item) {
			newUpgrades.set(entity, (newUpgrades.get(entity) ?? 0) + 1);
		}

		const newSkillsDeck = new Map(this.skillsDeck);
		if (entity instanceof Skill) {
			newSkillsDeck.set(entity, (newSkillsDeck.get(entity) ?? 0) + 1);
		}

		return new CharacterState({
			...this,
			upgrades: newUpgrades,
			skillsDeck: newSkillsDeck,
			availableXp: this.availableXp - (entity.xpCost ?? 0),
			gold: this.gold - (entity.goldCost ?? 0)
		});
	}

	public returnEntity(entity: Entity): CharacterState {
		const newUpgrades = new Map(this.upgrades);
		if (entity.xpCost || entity.goldCost || entity instanceof Ally || entity instanceof Item) {
			const currentCopies = newUpgrades.get(entity) ?? 0;
			if (currentCopies == 1) {
				newUpgrades.delete(entity);
			} else if (currentCopies > 1) {
				newUpgrades.set(entity, currentCopies - 1);
			}
		}

		const newSkillsDeck = new Map(this.skillsDeck);
		if (entity instanceof Skill) {
			const currentCopies = newSkillsDeck.get(entity) ?? 0;
			if (currentCopies == 1) {
				newSkillsDeck.delete(entity);
			} else if (currentCopies > 1) {
				newSkillsDeck.set(entity, currentCopies - 1);
			}
		}

		return new CharacterState({
			...this,
			upgrades: newUpgrades,
			skillsDeck: newSkillsDeck,
			availableXp: this.availableXp + (entity.xpCost ?? 0),
			gold: this.gold + (entity.goldCost ?? 0)
		});
	}

	private static normaliseUpgrades(
		upgrades: Record<string, number> | Map<Entity, number>
	): Map<Entity, number> {
		if (!(upgrades instanceof Map)) {
			upgrades = new Map(
				Object.entries(upgrades).map(([entityId, copies]) => [entities.require(entityId), copies])
			);
		}
		for (const [entity, copies] of upgrades) {
			if (copies < 1) {
				throw new Error(`Invalid number of copies ${copies} for entity ${entity.id}`);
			}
		}
		return upgrades;
	}

	private static normaliseSkillDeck(
		skillDeck: Record<string, number> | Map<Skill, number>
	): Map<Skill, number> {
		if (!(skillDeck instanceof Map)) {
			skillDeck = new Map(
				Object.entries(skillDeck).map(([skillId, copies]) => {
					const skill = entities.require(skillId);
					if (!(skill instanceof Skill)) {
						throw new Error(`Expected ${skillId} to be a skill`);
					}
					return [skill, copies];
				})
			);
		}

		for (const [skill, copies] of skillDeck) {
			if (copies < 1 || (skill.maxCopies !== undefined && copies > skill.maxCopies)) {
				throw new Error(`Invalid number of copies ${copies} for skill ${skill.id}`);
			}
		}
		return skillDeck;
	}

	/** The base stats of the character from permanent upgrades (ignores transient
	 * effects, such as equipment or temporary buffs). */
	getBaseStats(): Map<Stat, number> {
		const baseStats = new Map<Stat, number>();
		for (const stat of Object.values(stats)) {
			baseStats.set(stat, stat.startingValue);
		}
		this.upgrades.forEach((copies, entity) => {
			entity.permanentEffects().forEach((effect) => {
				for (const [statType, stat] of Object.entries(stats) as [StatType, Stat][]) {
					let value = baseStats.get(stat) ?? 0;
					for (let i = 0; i < copies; i++) {
						value = effect.setStat(statType, value);
					}
					baseStats.set(stat, value);
				}
			});
		});
		return baseStats;
	}

	/** Calculates the contents of the character's focus bag. */
	getFocusTokens(): Map<Focus, Record<number, number>> {
		const stats = this.getBaseStats();
		const bag = new Map<Focus, Record<number, number>>();
		bag.set(focuses.heroism, { 1: 1 });
		for (const attribute of Object.values(attributes)) {
			const focus = focuses[attribute.type as FocusType];
			const attributeValue = Math.min(stats.get(attribute)!, 6);
			bag.set(focus, FOCUS_TOKENS_FOR_STAT_VALUES[attributeValue]);
		}
		// TODO: Effects that modify the bag
		return bag;
	}
}
