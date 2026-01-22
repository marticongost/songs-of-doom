import { WoundedCondition } from '$lib/catalog/models/conditions';
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
	capabilities: [
		new Obligation({
			triggers: ['provoked'],
			effects: [
				new AttackEffect({
					expression: 'strength',
					damage: {
						'1': 1,
						'2': 3,
						'3': 4,
						'4': 5
					}
				})
			]
		}),
		new Obligation({
			triggers: ['attacking'],
			effects: [new WoundedCondition().then(new ModifyRollEffect({ modifier: 1 }))]
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
