import type { Property } from '../properties';
import { Condition } from './condition';

export interface PropertyConditionProps {
	/** The properties that the subject must have. */
	properties: Array<Property>;
}

/**
 * A condition that checks whether the subject has specific properties.
 * The condition is satisfied only if the subject has all the given properties.
 */
export class PropertyCondition extends Condition {
	readonly properties: Array<Property>;

	constructor({ properties }: PropertyConditionProps) {
		super();
		this.properties = properties;
	}
}
