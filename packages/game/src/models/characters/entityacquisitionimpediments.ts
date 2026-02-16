import type { Archetype } from '../archetype';

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
