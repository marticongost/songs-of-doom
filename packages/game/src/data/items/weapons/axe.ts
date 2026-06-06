import { Action, Opportunity } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { attack, defend } from '../../../models/effects';
import { Item } from '../../../models/entities/item';
import { plus, reactivePlayerIsTarget } from '../../../models/expressions';
import { strength } from '../../../models/stats';
import parry from '../../properties/parry';
import weapon from '../../properties/weapon';

export default new Item({
	title: { ca: 'Destral', es: 'Hacha', en: 'Axe' },
	slot: 'hand',
	properties: [weapon],
	maxCharges: 2,
	goldCost: 4,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			id: 'activate',
			cost: { strength: 1, charges: 1 },
			effects: [
				attack({
					expression: plus(strength, 1),
					results: { 1: 2, 2: 3, 3: 5 }
				})
			]
		}),
		new Opportunity({
			id: 'parry',
			cost: { charges: 1 },
			triggers: [{ event: 'attack', condition: reactivePlayerIsTarget }],
			effects: [
				defend({
					properties: [parry],
					expression: 1
				})
			]
		})
	]
});
