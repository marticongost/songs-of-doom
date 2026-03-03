import { Action } from '../../../models/capabilities';
import {
	AddChargesEffect,
	AttachEffect,
	discard,
	RemoveChargesEffect
} from '../../../models/effects';
import { charges, distance, eq } from '../../../models/expressions';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Jugar brut',
		es: 'Jugar sucio',
		en: 'Dirty tricks'
	},
	xpCost: variants.values(0, 2),
	discardReward: { intelligence: variants.level },
	capabilities: [
		new Action({
			cost: { intelligence: 2 },
			effects: [
				new AttachEffect({ target: { type: 'enemy', condition: eq(distance, 0) } }),
				new AddChargesEffect({ amount: variants.level + 1 })
			]
		})
	],
	maxCharges: variants.level + 1,
	attachmentCapabilities: [
		new Action({
			prioritary: true,
			effects: [new RemoveChargesEffect({ amount: 1 }), eq(charges, 0).then(discard)]
		})
	]
}));
