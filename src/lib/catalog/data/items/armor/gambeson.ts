import { Constant } from '$lib/catalog/models/constant';
import { ConferPropertiesEffect } from '$lib/catalog/models/effects';
import { Item } from '$lib/catalog/models/inventory';
import armor from '../../properties/armor';
import toughness from '../../properties/toughness';

export default new Item({
	title: {
		ca: 'Fasset',
		es: 'Gambesón',
		en: 'Gambeson'
	},
	slot: 'chest',
	properties: [armor],
	goldCost: 3,
	capabilities: [
		new Constant({
			effects: [new ConferPropertiesEffect({ properties: [toughness.with({ value: 1 })] })]
		})
	]
});
