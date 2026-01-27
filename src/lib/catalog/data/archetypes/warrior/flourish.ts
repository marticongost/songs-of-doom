import { PropertyCondition } from '$lib/catalog/models/conditions';
import { DrawFocusEffect, ResultsTableEffect } from '$lib/catalog/models/effects';
import { RechargeEffect } from '$lib/catalog/models/effects/recharge';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';
import weapon from '../../properties/weapon';

export default new Skill({
	title: {
		ca: 'Floritura',
		es: 'Floritura',
		en: 'Flourish'
	},
	xpCost: 0,
	discardReward: { agility: 1 },
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
								new RechargeEffect({
									amount: 1,
									target: {
										type: 'ownedObject',
										conditions: [new PropertyCondition({ properties: [weapon] })]
									}
								}),
								new DrawFocusEffect({ amount: 1 })
							]
						}
					]
				})
			]
		})
	]
});
