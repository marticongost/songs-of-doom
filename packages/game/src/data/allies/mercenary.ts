import { Ally } from '../../models/ally';
import { Action, Opportunity } from '../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../models/common';
import { AttackEffect, DefendEffect } from '../../models/effects';
import { strength } from '../../models/stats';
import toughness from '../properties/toughness';

export default new Ally({
	title: {
		ca: 'Mercenari',
		es: 'Mercenario',
		en: 'Mercenary'
	},
	stats: {
		strength: 4,
		agility: 3,
		intelligence: 3,
		charisma: 2,
		will: 2,
		health: 6,
		sanity: 4
	},
	maxCharges: 2,
	goldCost: 5,
	properties: [toughness.with({ value: 1 })],
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			cost: {
				charges: 1,
				gold: 1
			},
			effects: [
				new AttackEffect({
					expression: strength,
					results: {
						1: 2,
						2: 3,
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
		})
	]
});
