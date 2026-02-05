import { Action, Obligation } from '$lib/catalog/models/capabilities';
import {
	AttachEffect,
	ModifyCapabilityCostEffect,
	ModifyDamageEffect,
	ModifyRollEffect,
	NegateDamageEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { not } from '$lib/catalog/models/expressions';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';
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
										new NegateDamageEffect(),
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
