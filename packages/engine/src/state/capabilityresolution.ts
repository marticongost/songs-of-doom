import type { Capability, CapabilityCost, Reaction } from '@songsofdoom/game';
import type { CapabilityRef } from './cardstate';
import type { CardId, EntityId } from './identifiers';

export interface CapabilityResolutionProps extends CapabilityRef {
	/** Id of the subject (player, creature, ally) executing the capability. */
	subjectId: EntityId;

	/** Additional reactions that apply to the capability. Used by effects that modify
	 * capabilities, such as `TriggerActionEffect`. */
	additionalReactions?: Array<Reaction>;
}

export abstract class CapabilityResolution implements CapabilityRef {
	/** The capability being resolved. */
	readonly capability: Capability;

	/** Id of the subject (player, creature, ally) executing the capability. */
	readonly subjectId: EntityId;

	/** Id of the card providing the capability. */
	readonly cardId: CardId;

	/** The modified cost of executing the capability. */
	readonly cost: CapabilityCost;

	/** Additional reactions that apply to the capability. Used by effects that modify
	 * capabilities, such as `TriggerActionEffect`. */
	readonly additionalReactions: Array<Reaction>;

	constructor({ subjectId, cardId, capability, additionalReactions }: CapabilityResolutionProps) {
		this.subjectId = subjectId;
		this.cardId = cardId;
		this.capability = capability;
		this.cost = capability.cost;
		this.additionalReactions = additionalReactions ?? [];
	}

	abstract readonly(): ReadonlyCapabilityResolution;

	abstract mutable(): MutableCapabilityResolution;
}

export class ReadonlyCapabilityResolution extends CapabilityResolution {
	declare readonly capability: Capability;
	declare readonly subjectId: EntityId;
	declare readonly cardId: CardId;
	declare readonly cost: CapabilityCost;
	declare readonly additionalReactions: Array<Reaction>;

	override mutable(): MutableCapabilityResolution {
		return new MutableCapabilityResolution({
			capability: this.capability,
			subjectId: this.subjectId,
			cardId: this.cardId,
			additionalReactions: this.additionalReactions
		});
	}

	override readonly(): ReadonlyCapabilityResolution {
		return this;
	}
}

export class MutableCapabilityResolution extends CapabilityResolution {
	declare capability: Capability;
	declare subjectId: EntityId;
	declare cardId: CardId;
	declare cost: CapabilityCost;
	declare additionalReactions: Array<Reaction>;

	override mutable(): MutableCapabilityResolution {
		return this;
	}

	override readonly(): ReadonlyCapabilityResolution {
		return new ReadonlyCapabilityResolution({
			capability: this.capability,
			subjectId: this.subjectId,
			cardId: this.cardId,
			additionalReactions: this.additionalReactions
		});
	}
}
