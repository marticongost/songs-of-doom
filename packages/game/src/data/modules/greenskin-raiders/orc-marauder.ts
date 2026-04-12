import { Action, Obligation } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { attack, chase, defend, modifyRoll } from '../../../models/effects';
import { Creature } from '../../../models/entities/creature';
import { reactiveCardIsSubject, reactiveCardIsTarget, wounded } from '../../../models/expressions';
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
			effects: [chase()]
		}),
		new Action({
			cost: { charges: 1 },
			effects: [
				attack({
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
			triggers: [{ event: 'attack', condition: reactiveCardIsSubject }],
			effects: [wounded.then(modifyRoll(1))]
		}),
		new Obligation({
			triggers: [{ event: 'attack', condition: reactiveCardIsTarget }],
			effects: [
				defend({
					expression: 1
				})
			]
		})
	]
});
