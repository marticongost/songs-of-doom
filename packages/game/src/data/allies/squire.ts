import { Action, Constant, Opportunity } from '../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../models/common';
import { attack, defend, equip, modifyCarryingCapacity } from '../../models/effects';
import { Ally } from '../../models/entities/ally';
import { reactiveCardIsTarget } from '../../models/expressions';
import { strength } from '../../models/stats';
import follower from '../properties/follower';
import toughness from '../properties/toughness';

export default new Ally({
	title: {
		ca: 'Escuder',
		es: 'Escudero',
		en: 'Squire'
	},
	properties: [follower, toughness.with({ value: 1 })],
	stats: {
		strength: 3,
		agility: 3,
		intelligence: 3,
		charisma: 3,
		will: 3,
		health: 6,
		sanity: 5
	},
	maxCharges: 2,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			cost: {
				charges: 1,
				charisma: 1
			},
			effects: [
				attack({
					expression: strength,
					results: {
						1: 1,
						2: 2,
						3: 4
					}
				})
			]
		}),
		new Opportunity({
			triggers: [{ event: 'attack', condition: reactiveCardIsTarget }],
			cost: {
				charges: 1
			},
			effects: [defend(2)]
		}),
		new Constant({
			effects: [modifyCarryingCapacity(1)]
		}),
		new Action({
			cost: { charges: 1 },
			fast: true,
			effects: [equip()]
		})
	]
});
