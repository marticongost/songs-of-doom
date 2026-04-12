import type { Property, Result, ScalarExpressionType } from '../..';
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
}

export abstract class TestResolution {
	readonly subjectId: EntityId;
	readonly proficiency: ScalarExpressionType;
	readonly properties: Array<Property>;
	readonly result?: Result;

	constructor({ subjectId, proficiency, properties, result }: TestResolutionProps) {
		this.subjectId = subjectId;
		this.proficiency = proficiency;
		this.properties = properties;
		this.result = result;
	}
}

export class ReadonlyTestResolution extends TestResolution {
	declare readonly subjectId: EntityId;
	declare readonly proficiency: ScalarExpressionType;
	declare readonly properties: Array<Property>;
	declare readonly result?: Result;

	mutable(): MutableTestResolution {
		return new MutableTestResolution({
			subjectId: this.subjectId,
			proficiency: this.proficiency,
			properties: this.properties,
			result: this.result
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

	readonly(): ReadonlyTestResolution {
		return new ReadonlyTestResolution({
			subjectId: this.subjectId,
			proficiency: this.proficiency,
			properties: this.properties,
			result: this.result
		});
	}
}
