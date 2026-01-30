import type { LocalisedText } from '$lib/localisation';
import { BooleanExpression } from '../expressions/boolean-expression';

export interface PropertyProps {
	title: LocalisedText;
	description?: LocalisedText;
}

export abstract class Property extends BooleanExpression {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;

	constructor(props: PropertyProps) {
		super();
		this.title = props.title;
		this.description = props.description;
	}
}
