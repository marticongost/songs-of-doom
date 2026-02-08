import { Ally } from '$lib/catalog/models/ally';
import { Action, Opportunity } from '$lib/catalog/models/capabilities';
import { fullyRechargeOnChapterStart } from '$lib/catalog/models/common';
import { AttackEffect, DefendEffect } from '$lib/catalog/models/effects';
import { strength } from '$lib/catalog/models/stats';
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
					damage: [
						{ result: 1, inflictedDamage: 2 },
						{ result: 2, inflictedDamage: 3 },
						{ result: 3, inflictedDamage: 4 }
					]
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
