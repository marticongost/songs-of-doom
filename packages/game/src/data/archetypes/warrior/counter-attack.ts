import { Opportunity } from '../../../models/capabilities';
import {
	ModifyCapabilityCostEffect,
	ModifyDamageEffect,
	ModifyRollEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { effectiveDefense, gte } from '../../../models/expressions';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Contraatac',
		es: 'Contraataque',
		en: 'Counter Attack'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: 1, strength: variants.values(0, 1) },
	capabilities: [
		new Opportunity({
			triggers: ['afterReceivedAttackResolved'],
			cost: { agility: 1 },
			effects: [
				new ResultsTableEffect({
					entries: [
						{
							result: 0,
							effects: [
								gte(effectiveDefense, 1).then(
									new TriggerAttackEffect({
										modifiers: [
											new ModifyRollEffect({
												modifier: effectiveDefense
											}),
											...variants.ifMatches(
												2,
												new ModifyDamageEffect({ amount: effectiveDefense })
											),
											new ModifyCapabilityCostEffect({
												cost: {
													strength: -1,
													charges: -1
												}
											})
										]
									})
								)
							]
						}
					]
				})
			]
		})
	]
}));
