import { Constant } from '$lib/catalog/models/constant';
import { ConferPropertiesEffect } from '$lib/catalog/models/effects';
import { Item } from '$lib/catalog/models/inventory';
import armor from '../../properties/armor';
import toughness from '../../properties/toughness';

export default new Item({
	title: {
		ca: 'Cota de malla',
		es: 'Cota de malla',
		en: 'Chainmail'
	},
	slot: 'chest',
	properties: [armor],
	capabilities: [
		new Constant({
			effects: [new ConferPropertiesEffect({ properties: [toughness.with({ value: 2 })] })]
		})
	]
});
