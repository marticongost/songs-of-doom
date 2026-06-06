import { Action, Opportunity } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { attack, defend } from '../../../models/effects';
import { Item } from '../../../models/entities/item';
import { plus, reactivePlayerIsTarget } from '../../../models/expressions';
import { strength } from '../../../models/stats';
import parry from '../../properties/parry';
import weapon from '../../properties/weapon';

export default new Item({
	title: { ca: 'Espasa llarga', es: 'Espada larga', en: 'Longsword' },
	slot: 'hand',
	properties: [weapon],
	maxCharges: 3,
	goldCost: 5,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			id: 'attack',
			cost: { strength: 1, charges: 1 },
			effects: [
				attack({
					expression: plus(strength, 1),
					results: { 1: 1, 2: 3, 3: 4 }
				})
			]
		}),
		new Action({
			id: 'strongAttack',
			cost: { agility: 1, strength: 1, charges: 1 },
			effects: [
				attack({
					expression: plus(strength, 2),
					results: { 1: 2, 2: 4, 3: 5 }
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
					expression: 2
				})
			]
		})
	]
});
