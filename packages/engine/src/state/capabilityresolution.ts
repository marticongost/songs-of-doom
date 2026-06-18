import type { CapabilityCost, Reaction } from '@songsofdoom/game';
import type { CapabilityRef } from './cardstate';
import type { CardId, EntityId } from './identifiers';

export interface CapabilityResolutionProps extends CapabilityRef {
	/** The capability being resolved. */
	readonly capabilityId: string;

	/** Id of the card providing the capability. */
	cardId: CardId;

	/** Id of the subject (player, creature, ally) executing the capability. */
	subjectId: EntityId;

	/** The cost of executing the capability. */
	cost: CapabilityCost;

	/** Additional reactions that apply to the capability. Used by effects that modify
	 * capabilities, such as `TriggerActionEffect`. */
	additionalReactions?: Array<Reaction>;
}

export abstract class CapabilityResolution implements CapabilityRef {
	/** The capability being resolved. */
	readonly capabilityId: string;

	/** Id of the subject (player, creature, ally) executing the capability. */
	readonly subjectId: EntityId;

	/** Id of the card providing the capability. */
	readonly cardId: CardId;

	/** The modified cost of executing the capability. */
	readonly cost: CapabilityCost;

	/** Additional reactions that apply to the capability. Used by effects that modify
	 * capabilities, such as `TriggerActionEffect`. */
	readonly additionalReactions: Array<Reaction>;

	constructor({
		subjectId,
		cardId,
		capabilityId,
		cost,
		additionalReactions
	}: CapabilityResolutionProps) {
		this.subjectId = subjectId;
		this.cardId = cardId;
		this.capabilityId = capabilityId;
		this.cost = cost;
		this.additionalReactions = additionalReactions ?? [];
	}

	abstract readonly(): ReadonlyCapabilityResolution;

	abstract mutable(): MutableCapabilityResolution;
}

export class ReadonlyCapabilityResolution extends CapabilityResolution {
	declare readonly capabilityId: string;
	declare readonly subjectId: EntityId;
	declare readonly cardId: CardId;
	declare readonly cost: CapabilityCost;
	declare readonly additionalReactions: Array<Reaction>;

	override mutable(): MutableCapabilityResolution {
		return new MutableCapabilityResolution({
			capabilityId: this.capabilityId,
			subjectId: this.subjectId,
			cardId: this.cardId,
			additionalReactions: this.additionalReactions,
			cost: this.cost
		});
	}

	override readonly(): ReadonlyCapabilityResolution {
		return this;
	}
}

export class MutableCapabilityResolution extends CapabilityResolution {
	declare capabilityId: string;
	declare subjectId: EntityId;
	declare cardId: CardId;
	declare cost: CapabilityCost;
	declare additionalReactions: Array<Reaction>;

	override mutable(): MutableCapabilityResolution {
		return this;
	}

	override readonly(): ReadonlyCapabilityResolution {
		return new ReadonlyCapabilityResolution({
			capabilityId: this.capabilityId,
			subjectId: this.subjectId,
			cardId: this.cardId,
			additionalReactions: this.additionalReactions,
			cost: this.cost
		});
	}
}
