import { Action, Constant, Obligation, Opportunity } from '../../../models/capabilities';
import {
	AddChargesEffect,
	AttachEffect,
	discard,
	immobilize,
	negateDamage,
	OneOfEffect,
	PayEffect,
	RemoveChargesEffect
} from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Santuari',
		es: 'Santuario',
		en: 'Sanctuary'
	},
	xpCost: variants.values(0, 1),
	maxCharges: variants.values(2, 3),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Action({
			cost: { will: 2 },
			effects: [new AttachEffect({}), new AddChargesEffect({ amount: variants.values(2, 3) })]
		})
	],
	attachmentCapabilities: [
		new Constant({
			effects: [immobilize]
		}),
		new Obligation({
			triggers: ['takingDamage'],
			cost: { charges: 1 },
			effects: [negateDamage]
		}),
		new Opportunity({
			triggers: ['chapterStart'],
			cost: { will: 1 },
			effects: [
				new OneOfEffect({
					effects: [new PayEffect({ cost: { will: 1 } }), new RemoveChargesEffect({ amount: 1 })]
				})
			]
		}),
		new Obligation({
			triggers: ['fullyDischarged'],
			effects: [discard]
		})
	]
}));
