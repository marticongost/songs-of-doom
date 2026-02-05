import { Opportunity } from '$lib/catalog/models/capabilities';
import { ModifyDamageEffect, ResultsTableEffect } from '$lib/catalog/models/effects';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Impacte brutal',
		es: 'Impacto brutal',
		en: 'Brutal hit'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		strength: variants.values(2, 3)
	},
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: { strength: 1 },
			effects: [
				new ResultsTableEffect({
					entries: [
						{ result: '2+', effects: [new ModifyDamageEffect({ amount: variants.values(1, 2) })] }
					]
				})
			]
		})
	]
}));
