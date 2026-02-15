import { Action, Obligation } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { Creature } from '../../../models/creature';
import { AttackEffect, chase, DefendEffect, ModifyRollEffect } from '../../../models/effects';
import { wounded } from '../../../models/expressions';
import { strength } from '../../../models/stats';

export default new Creature({
	title: {
		ca: 'Incursor orc',
		es: 'Incursor orco',
		en: 'Orc incursor'
	},
	stats: {
		agility: 2,
		strength: 4,
		intelligence: 2,
		charisma: 1,
		will: 3,
		health: 5
	},
	maxCharges: 3,
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
					results: {
						'1': 1,
						'2': 3,
						'3': 4
					}
				})
			]
		}),
		new Obligation({
			triggers: ['attacking'],
			effects: [wounded.then(new ModifyRollEffect({ modifier: 1 }))]
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
