import { Property, type PropertyProps } from './property';

export type CardTypeProps = Exclude<PropertyProps, 'description'>;

export class CardType extends Property {
	constructor(props: CardTypeProps) {
		super({
			...props,
			description: {
				ca: 'Estableix el tipus de la carta.'
			}
		});
	}
}
