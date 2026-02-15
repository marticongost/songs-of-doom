import { Constant } from '../../../models/capabilities';
import { ConferPropertiesEffect } from '../../../models/effects';
import { Item } from '../../../models/inventory';
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
	goldCost: 6,
	capabilities: [
		new Constant({
			effects: [new ConferPropertiesEffect({ properties: [toughness.with({ value: 2 })] })]
		})
	]
});
