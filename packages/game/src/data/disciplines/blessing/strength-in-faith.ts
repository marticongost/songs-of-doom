import { reactiveCardIsSubject } from '../../..';
import { Action, Obligation } from '../../../models/capabilities';
import {
	addCharges,
	attach,
	discard,
	modifyDamage,
	modifyRoll,
	replaceProperty,
	triggerAttack
} from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';
import { holy, physical } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'La força de la fe',
		es: 'La fuerza de la fe',
		en: 'Strength in faith'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		will: variants.level
	},
	maxCharges: variants.values(2, 3),
	capabilities: [
		new Action({
			cost: { will: 2 },
			effects: [attach({}), addCharges(variants.values(2, 3))]
		})
	],
	attachmentCapabilities: [
		new Action({
			cost: { will: 2, charges: 1 },
			effects: [
				triggerAttack({
					modifiers: [
						replaceProperty({ original: physical, replacement: holy }),
						modifyRoll(2),
						modifyDamage(2)
					]
				})
			]
		}),
		new Obligation({
			triggers: [{ event: 'fullyDischarged', condition: reactiveCardIsSubject }],
			effects: [discard()]
		})
	]
}));
