import {
	ModifyRollEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { Reaction } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Contraatac',
		es: 'Contraataque',
		en: 'Counter Attack'
	},
	xpCost: 0,
	discardReward: {
		agility: 1
	},
	capabilities: [
		new Reaction({
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
										})
										// TODO: Change ModifyCapabilityCostEffect to allow:
										// - Reducing the cost in charges
										// - Select any aptitude (player's choice)
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
