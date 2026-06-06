import { Action, Obligation } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { attack, chase, defend } from '../../../models/effects';
import { Creature } from '../../../models/entities/creature';
import { reactiveCardIsTarget } from '../../../models/expressions';
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
			id: 'chase',
			cost: { charges: 1 },
			effects: [chase()]
		}),
		new Action({
			id: 'attack',
			cost: { charges: 1 },
			effects: [
				attack({
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
			id: 'defend',
			triggers: [{ event: 'attack', condition: reactiveCardIsTarget }],
			effects: [
				defend({
					expression: 1
				})
			]
		})
	]
});
