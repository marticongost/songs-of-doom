import {
	ModifyCapabilityCostEffect,
	ModifyDamageEffect,
	ModifyRollEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { effectiveDefense, gte } from '$lib/catalog/models/expressions';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

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
