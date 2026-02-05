import { DrawCardsEffect, DrawFocusEffect, ResultsTableEffect } from '$lib/catalog/models/effects';
import { AddChargesEffect } from '$lib/catalog/models/effects/recharge';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';
import weapon from '../../properties/weapon';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Floritura',
		es: 'Floritura',
		en: 'Flourish'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: { agility: 2 },
			effects: [
				new ResultsTableEffect({
					entries: [
						{
							result: '2+',
							effects: [
								new AddChargesEffect({
									amount: 1,
									target: {
										type: 'ownedObject',
										condition: weapon
									}
								}),
								new DrawFocusEffect({ amount: 1 }),
								...variants.ifMatches(2, new DrawCardsEffect({ amount: 1 }))
							]
						}
					]
				})
			]
		})
	]
}));
