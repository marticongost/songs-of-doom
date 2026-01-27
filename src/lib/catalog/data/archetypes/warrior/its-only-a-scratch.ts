import { DiscardCardEffect, NegateDamageEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Només és una rascada',
		es: 'Es solo un rasguño',
		en: "It's only a scratch"
	},
	xpCost: 0,
	discardReward: { will: 1 },
	capabilities: [
		new Opportunity({
			triggers: ['takingDamage'],
			cost: {
				will: 2
			},
			effects: [new NegateDamageEffect(), new DiscardCardEffect({ amount: 1 })]
		})
	]
});
