import { ModifyDamageEffect, ResultsTableEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Impacte brutal',
		es: 'Impacto brutal',
		en: 'Brutal hit'
	},
	xpCost: 0,
	discardReward: {
		strength: 2
	},
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: { strength: 1 },
			effects: [
				new ResultsTableEffect({
					entries: [{ result: '2+', effects: [new ModifyDamageEffect({ amount: 1 })] }]
				})
			]
		})
	]
	// TODO: Test 2+ -> +1 damage
});
