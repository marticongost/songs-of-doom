import { Action, Constant, Obligation } from '../../../models/capabilities';
import {
	AddChargesEffect,
	AttachEffect,
	discard,
	immobilize,
	RemoveChargesEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { charges, eq } from '../../../models/expressions';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Atac immobilitzant',
		es: 'Ataque inmobilizante',
		en: 'Pinning attack'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: [
		new Action({
			cost: { agility: 2 },
			effects: [
				new TriggerAttackEffect({
					modifiers: [
						new ResultsTableEffect({
							'2+': [
								new AttachEffect({ target: 'defender' }),
								new AddChargesEffect({ amount: variants.level })
							]
						})
					]
				})
			]
		})
	],
	attachmentCapabilities: [
		new Constant({ effects: [immobilize] }),
		new Obligation({
			triggers: ['turnEnd'],
			effects: [new RemoveChargesEffect({ amount: 1 }), eq(charges, 0).then(discard)]
		})
	]
}));
