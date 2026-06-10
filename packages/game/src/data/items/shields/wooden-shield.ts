import { Opportunity } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { defend } from '../../../models/effects';
import { Item } from '../../../models/entities/item';
import { reactivePlayerIsTarget } from '../../../models/expressions';
import shield from '../../properties/shield';

export default new Item({
	title: { ca: 'Escut de fusta', es: 'Escudo de madera', en: 'Wooden Shield' },
	slot: 'hand',
	properties: [shield],
	goldCost: 3,
	maxCharges: 2,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Opportunity({
			id: 'activate',
			triggers: [{ event: 'attack', condition: reactivePlayerIsTarget }],
			cost: { charges: 1, agility: 1 },
			effects: [
				defend({
					expression: 2
				})
			]
		})
	]
});
