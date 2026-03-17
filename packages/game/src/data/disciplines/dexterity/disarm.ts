import { Action, Obligation } from '../../../models/capabilities';
import {
	attach,
	modifyCapabilityCost,
	modifyDamage,
	modifyRoll,
	negateDamage,
	resultsTable,
	triggerAttack
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
				triggerAttack({
					condition: not(projectile),
					modifiers: [
						modifyCapabilityCost({ cost: { agility: -variants.level } }),
						resultsTable({
							entries: [
								{
									result: variants.values('2+', '1+'),
									effects: [
										negateDamage(),
										attach({
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
			effects: [modifyRoll(-2), modifyDamage(-1)]
		})
	]
}));
