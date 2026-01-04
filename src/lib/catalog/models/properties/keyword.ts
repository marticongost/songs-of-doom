import { Property, type PropertyProps } from './property';

export type KeywordProps = Exclude<PropertyProps, 'description'>;

export class Keyword extends Property {
	constructor(props: KeywordProps) {
		super({
			...props,
			description: {
				ca: "Estableix una paraula clau, que pot activar capacitats o efectes d'altres cartes."
			}
		});
	}
}
