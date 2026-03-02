import { Opportunity } from '../../../models/capabilities';
import { DrawCardsEffect, DrawFocusEffect, ResultsTableEffect } from '../../../models/effects';
import { AddChargesEffect } from '../../../models/effects/recharge';
import { and, owned } from '../../../models/expressions';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';
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
										type: 'object',
										condition: and(owned, weapon)
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
