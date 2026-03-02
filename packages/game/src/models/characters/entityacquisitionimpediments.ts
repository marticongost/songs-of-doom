import type { Archetype } from '../archetype';
import type { Discipline } from '../discipline';

/** An impediment that prevents a character from acquiring an entity. */
export abstract class EntityAcquisitionImpediment {}

/** Indicates that the trait is innate and cannot be acquired after the character's
 * creation. */
export class InnateTraitImpediment extends EntityAcquisitionImpediment {}

/**
 * Indicates that the entity is exclusive to a specific archetype and cannot be acquired
 * unless the archetype is also acquired first.
 */
export class ArchetypeRequiredImpediment extends EntityAcquisitionImpediment {
	readonly archetype: Archetype;

	constructor(archetype: Archetype) {
		super();
		this.archetype = archetype;
	}
}

/**
 * Indicates that the entity belongs to a discipline that is not yet unlocked.
 * The character must acquire at least one of the unlocking archetypes to gain access.
 */
export class DisciplineRequiredImpediment extends EntityAcquisitionImpediment {
	readonly discipline: Discipline;
	readonly unlockingArchetypes: ReadonlyArray<Archetype>;

	constructor(discipline: Discipline, unlockingArchetypes: ReadonlyArray<Archetype>) {
		super();
		this.discipline = discipline;
		this.unlockingArchetypes = unlockingArchetypes;
	}
}

/** Indicates that the maximum number of the entity have already been purchased. */
export class LimitReachedImpediment extends EntityAcquisitionImpediment {
	readonly maxCopies: number;

	constructor(maxCopies: number) {
		super();
		this.maxCopies = maxCopies;
	}
}

/** Indicates that the character does not have enough experience to acquire the entity. */
export class InsufficientExperienceImpediment extends EntityAcquisitionImpediment {
	readonly requiredExperience: number;

	constructor(requiredExperience: number) {
		super();
		this.requiredExperience = requiredExperience;
	}
}

/** Indicates that the character does not have enough gold to acquire the entity. */
export class InsufficientGoldImpediment extends EntityAcquisitionImpediment {
	readonly requiredGold: number;

	constructor(requiredGold: number) {
		super();
		this.requiredGold = requiredGold;
	}
}
