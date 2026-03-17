import { Action, Obligation } from '../../../models/capabilities';
import {
	AddChargesEffect,
	AttachEffect,
	ConferPropertiesEffect,
	discard,
	ModifyDamageEffect,
	ModifyRollEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';
import { holy } from '../../properties';

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
			effects: [new AttachEffect({}), new AddChargesEffect({ amount: variants.values(2, 3) })]
		})
	],
	attachmentCapabilities: [
		new Action({
			cost: { will: 2, charges: 1 },
			effects: [
				new TriggerAttackEffect({
					modifiers: [
						new ConferPropertiesEffect({ properties: [holy] }),
						new ModifyRollEffect({ modifier: 2 }),
						new ModifyDamageEffect({ amount: 2 })
					]
				})
			]
		}),
		new Obligation({
			triggers: ['fullyDischarged'],
			effects: [discard]
		})
	]
}));
