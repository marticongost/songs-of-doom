import { Constant } from '$lib/catalog/models/constant';
import { ConferPropertiesEffect } from '$lib/catalog/models/effects';
import { Item } from '$lib/catalog/models/inventory';
import armor from '../../properties/armor';
import toughness from '../../properties/toughness';

export default new Item({
	title: {
		ca: 'Cuirassa',
		es: 'Coraza',
		en: 'Cuirass'
	},
	slot: 'chest',
	properties: [armor],
	goldCost: 12,
	capabilities: [
		new Constant({
			effects: [new ConferPropertiesEffect({ properties: [toughness.with({ value: 3 })] })]
		})
	]
});
