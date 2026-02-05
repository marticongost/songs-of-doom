import { Action } from '$lib/catalog/models/capabilities';
import { HealEffect } from '$lib/catalog/models/effects';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Primers auxilis',
		es: 'Primeros auxilios',
		en: 'First aid'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		any: 1
	},
	capabilities: [
		new Action({
			cost: {
				intelligence: 2
			},
			effects: [new HealEffect({ amount: variants.values(2, 3) })]
		})
	]
}));
