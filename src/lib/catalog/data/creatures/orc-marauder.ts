import { WoundedCondition } from '$lib/catalog/models/conditions';
import { Creature } from '$lib/catalog/models/creature';
import {
	AttackEffect,
	ConditionalEffect,
	DefendEffect,
	ModifyRollEffect
} from '$lib/catalog/models/effects';
import { Reaction } from '$lib/catalog/models/reaction';

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
		new Reaction({
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
		new Reaction({
			triggers: ['attacking'],
			effects: [
				new ConditionalEffect({
					cases: [
						{
							condition: new WoundedCondition(),
							effects: [new ModifyRollEffect({ modifier: 1 })]
						}
					]
				})
			]
		}),
		new Reaction({
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					expression: 'agility'
				})
			]
		})
	]
});
