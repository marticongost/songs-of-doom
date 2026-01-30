import {
	ModifyCapabilityCostEffect,
	ModifyRollEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { effectiveDefense, gte } from '$lib/catalog/models/expressions';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Contraatac',
		es: 'Contraataque',
		en: 'Counter Attack'
	},
	xpCost: 0,
	discardReward: { agility: 1 },
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
});
