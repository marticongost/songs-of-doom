import { Constant } from '../../../models/capabilities';
import { conferProperties } from '../../../models/effects';
import { Item } from '../../../models/entities/item';
import armor from '../../properties/armor';
import toughness from '../../properties/toughness';
import { mediumArmour } from '../../talents';

export default new Item({
	title: {
		ca: 'Cota de malla',
		es: 'Cota de malla',
		en: 'Chainmail'
	},
	slot: 'chest',
	properties: [armor],
	goldCost: 6,
	requiredTalent: mediumArmour,
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [conferProperties({ properties: [toughness.with({ value: 2 })] })]
		})
	]
});
