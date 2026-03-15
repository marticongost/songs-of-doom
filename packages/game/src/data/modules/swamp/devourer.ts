import { Action, Obligation } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { Creature } from '../../../models/entities/creature';
import { AttackEffect, chase, DefendEffect } from '../../../models/effects';
import { strength } from '../../../models/stats';
import disruption from '../../properties/disruption';
import piercing from '../../properties/piercing';
import toughness from '../../properties/toughness';

export default new Creature({
	title: {
		ca: 'Devorador',
		es: 'Devorador',
		en: 'Devourer'
	},
	stats: {
		strength: 5,
		agility: 3,
		intelligence: 2,
		charisma: 1,
		will: 3,
		health: 8
	},
	maxCharges: 3,
	properties: [toughness.with({ value: 2 })],
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			cost: { charges: 1 },
			effects: [chase]
		}),
		new Action({
			cost: { charges: 1 },
			effects: [
				new AttackEffect({
					expression: strength,
					properties: [piercing.with({ value: 1 }), disruption.with({ value: 1 })],
					results: {
						'1': 2,
						'2': 4,
						'3': 6
					}
				})
			]
		}),
		new Obligation({
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					expression: 1
				})
			]
		})
	]
});
