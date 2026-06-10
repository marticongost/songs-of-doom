import { Constant } from '../../../models/capabilities';
import { conferProperties } from '../../../models/effects';
import { Item } from '../../../models/entities/item';
import armor from '../../properties/armor';
import toughness from '../../properties/toughness';
import { lightArmour } from '../../talents';

export default new Item({
	title: {
		ca: 'Fasset',
		es: 'Gambesón',
		en: 'Gambeson'
	},
	slot: 'chest',
	properties: [armor],
	goldCost: 3,
	requiredTalent: lightArmour,
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [conferProperties({ properties: [toughness.with({ value: 1 })] })]
		})
	]
});
