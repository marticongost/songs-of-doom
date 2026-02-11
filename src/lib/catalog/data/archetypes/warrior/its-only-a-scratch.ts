import { Opportunity } from '$lib/catalog/models/capabilities';
import { DiscardFromHandEffect, negateDamage } from '$lib/catalog/models/effects';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Només és una rascada',
		es: 'Es solo un rasguño',
		en: "It's only a scratch"
	},
	xpCost: variants.values(0, 1),
	discardReward: { will: 1 },
	capabilities: [
		new Opportunity({
			triggers: ['takingDamage'],
			cost: {
				will: 2
			},
			effects: [negateDamage, ...variants.ifMatches(1, new DiscardFromHandEffect({ amount: 1 }))]
		})
	]
}));
