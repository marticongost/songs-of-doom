import type { LocalisedText } from '$lib/localisation';

export interface PropertyProps {
	title: LocalisedText;
	description?: LocalisedText;
}

export abstract class Property {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;

	constructor(props: PropertyProps) {
		this.title = props.title;
		this.description = props.description;
	}
}
