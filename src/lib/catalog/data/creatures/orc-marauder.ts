import { Action } from '$lib/catalog/models/action';
import { fullyRechargeOnChapterStart } from '$lib/catalog/models/common';
import { WOUNDED } from '$lib/catalog/models/conditions/wounded-condition';
import { Creature } from '$lib/catalog/models/creature';
import { AttackEffect, DefendEffect, ModifyRollEffect } from '$lib/catalog/models/effects';
import { Obligation } from '$lib/catalog/models/reaction';

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
			effects: [
				new AttackEffect({
					expression: 'strength',
					damage: {
						'1': 1,
						'2': 3,
						'3': 4
					}
				})
			]
		}),
		new Obligation({
			triggers: ['attacking'],
			effects: [WOUNDED.then(new ModifyRollEffect({ modifier: 1 }))]
		}),
		new Obligation({
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					expression: 'agility'
				})
			]
		})
	]
});
