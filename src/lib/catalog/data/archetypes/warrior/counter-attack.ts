import { reduceCostByDiscarding } from '$lib/catalog/models/common';
import {
	ModifyCapabilityCostEffect,
	ModifyRollEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Contraatac',
		es: 'Contraataque',
		en: 'Counter Attack'
	},
	xpCost: 0,
	capabilities: [
		reduceCostByDiscarding({ agility: -1 }),
		new Opportunity({
			triggers: ['afterDefending'],
			cost: { agility: 1 },
			effects: [
				new ResultsTableEffect({
					entries: [
						{
							result: '2+',
							effects: [
								new TriggerAttackEffect({
									modifiers: [
										new ModifyRollEffect({
											modifier: 1
										}),
										new ModifyCapabilityCostEffect({
											cost: {
												strength: -1,
												charges: -1
											}
										})
									]
								})
							]
						}
					]
				})
			]
		})
	]
});
