import { Ally } from '$lib/catalog/models/ally';
import { Action, Constant, Opportunity } from '$lib/catalog/models/capabilities';
import { fullyRechargeOnChapterStart } from '$lib/catalog/models/common';
import {
	AttackEffect,
	DefendEffect,
	EquipEffect,
	ModifyCarryingCapacityEffect
} from '$lib/catalog/models/effects';
import { strength } from '$lib/catalog/models/stats';
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
				new AttackEffect({
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
			triggers: ['receivingAttack'],
			cost: {
				charges: 1
			},
			effects: [new DefendEffect({ expression: 2 })]
		}),
		new Constant({
			effects: [new ModifyCarryingCapacityEffect({ modifier: 1 })]
		}),
		new Action({
			cost: { charges: 1 },
			fast: true,
			effects: [new EquipEffect()]
		})
	]
});
