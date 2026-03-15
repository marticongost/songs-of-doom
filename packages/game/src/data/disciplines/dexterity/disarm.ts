import { Action, Obligation } from '../../../models/capabilities';
import {
	AttachEffect,
	ModifyCapabilityCostEffect,
	ModifyDamageEffect,
	ModifyRollEffect,
	negateDamage,
	ResultsTableEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { not } from '../../../models/expressions';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';
import projectile from '../../properties/projectile';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Desarmar',
		en: 'Disarm',
		es: 'Desarmar'
	},
	xpCost: variants.values(0, 1),
	discardReward: { agility: 2 },
	capabilities: [
		new Action({
			cost: {
				agility: variants.level
			},
			effects: [
				new TriggerAttackEffect({
					condition: not(projectile),
					modifiers: [
						new ModifyCapabilityCostEffect({ cost: { agility: -variants.level } }),
						new ResultsTableEffect({
							entries: [
								{
									result: variants.values('2+', '1+'),
									effects: [
										negateDamage,
										new AttachEffect({
											target: {
												type: 'defender'
											}
										})
									]
								}
							]
						})
					]
				})
			]
		})
	],
	attachmentCapabilities: [
		new Obligation({
			triggers: ['attacking'],
			effects: [new ModifyRollEffect({ modifier: -2 }), new ModifyDamageEffect({ amount: -1 })]
		})
	]
}));
