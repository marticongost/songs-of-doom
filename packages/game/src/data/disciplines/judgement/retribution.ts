import { reactiveCardIsSubject, reactivePlayerIsTarget } from '../../..';
import { Action, Opportunity } from '../../../models/capabilities';
import {
	addCharges,
	attach,
	discard,
	modifyDamage,
	modifyRoll,
	saveTargetToVariable,
	triggerAttack
} from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Retribució',
		es: 'Retribución',
		en: 'Retribution'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		strength: variants.level
	},
	capabilities: [
		new Opportunity({
			triggers: [{ event: 'damageDealt', condition: reactivePlayerIsTarget }],
			cost: { strength: 2 },
			effects: [
				saveTargetToVariable({ name: 'X', value: { type: 'attacker' } }),
				attach(),
				addCharges(variants.values(2, 3))
			]
		})
	],
	attachmentCapabilities: [
		new Action({
			cost: { charges: 1 },
			effects: [
				triggerAttack({
					target: { variable: 'X' },
					modifiers: [modifyRoll(2), modifyDamage(1)]
				})
			]
		}),
		new Opportunity({
			triggers: [{ event: 'fullyDischarged', condition: reactiveCardIsSubject }],
			effects: [discard()]
		})
	]
}));
