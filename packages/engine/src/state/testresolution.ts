import type { Property, Reaction, Result, ScalarExpressionType } from '@songsofdoom/game';
import type { CapabilityRef } from './cardstate';
import type { EntityId } from './identifiers';

export interface TestResolutionProps {
	/** Id of the entity performing the test. */
	subjectId: EntityId;

	/** Expression indicating the proficiency level of the test. */
	proficiency: ScalarExpressionType;

	/** Properties associated with the test. */
	properties: Array<Property>;

	/** The result of the test, if it has been resolved. */
	result?: Result;

	/** Additional reactions attached to the test for its duration. */
	additionalReactions?: Array<CapabilityRef<Reaction>>;
}

export abstract class TestResolution {
	readonly subjectId: EntityId;
	readonly proficiency: ScalarExpressionType;
	readonly properties: Array<Property>;
	readonly result?: Result;
	readonly additionalReactions?: Array<CapabilityRef<Reaction>>;

	constructor({
		subjectId,
		proficiency,
		properties,
		result,
		additionalReactions
	}: TestResolutionProps) {
		this.subjectId = subjectId;
		this.proficiency = proficiency;
		this.properties = properties;
		this.result = result;
		this.additionalReactions = additionalReactions;
	}
}

export class ReadonlyTestResolution extends TestResolution {
	declare readonly subjectId: EntityId;
	declare readonly proficiency: ScalarExpressionType;
	declare readonly properties: Array<Property>;
	declare readonly result?: Result;
	declare readonly additionalReactions?: Array<CapabilityRef<Reaction>>;

	mutable(): MutableTestResolution {
		return new MutableTestResolution({
			subjectId: this.subjectId,
			proficiency: this.proficiency,
			properties: this.properties,
			result: this.result,
			additionalReactions: this.additionalReactions
		});
	}

	mutate(change: (state: MutableTestResolution) => void): ReadonlyTestResolution {
		const mutableResolution = this.mutable();
		change(mutableResolution);
		return mutableResolution.readonly();
	}
}

export class MutableTestResolution extends TestResolution {
	declare proficiency: ScalarExpressionType;
	declare properties: Array<Property>;
	declare result?: Result;
	declare additionalReactions?: Array<CapabilityRef<Reaction>>;

	/** Appends a reaction to the test's additional reactions list. */
	addReaction(reaction: CapabilityRef<Reaction>): void {
		if (!this.additionalReactions) {
			this.additionalReactions = [];
		}
		this.additionalReactions.push(reaction);
	}

	readonly(): ReadonlyTestResolution {
		return new ReadonlyTestResolution({
			subjectId: this.subjectId,
			proficiency: this.proficiency,
			properties: this.properties,
			result: this.result,
			additionalReactions: this.additionalReactions
		});
	}
}
