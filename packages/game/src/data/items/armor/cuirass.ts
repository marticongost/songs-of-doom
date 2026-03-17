import { Constant } from '../../../models/capabilities';
import { conferProperties } from '../../../models/effects';
import { Item } from '../../../models/entities/item';
import armor from '../../properties/armor';
import toughness from '../../properties/toughness';
import { heavyArmour } from '../../talents';

export default new Item({
	title: {
		ca: 'Cuirassa',
		es: 'Coraza',
		en: 'Cuirass'
	},
	slot: 'chest',
	properties: [armor],
	goldCost: 12,
	requiredTalent: heavyArmour,
	capabilities: [
		new Constant({
			effects: [conferProperties({ properties: [toughness.with({ value: 3 })] })]
		})
	]
});
