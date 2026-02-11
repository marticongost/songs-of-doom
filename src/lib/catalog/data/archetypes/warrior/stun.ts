import { Opportunity } from '$lib/catalog/models/capabilities';
import { negateDamage, RemoveChargesEffect } from '$lib/catalog/models/effects';
import { result } from '$lib/catalog/models/expressions';
import type { ScalarExpressionType } from '$lib/catalog/models/expressions/scalar-expression';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Estabornir',
		es: 'Aturdir',
		en: 'Stun'
	},
	xpCost: variants.values(0, 1),
	discardReward: { strength: variants.level },
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: {
				strength: 2
			},
			effects: [
				negateDamage,
				new RemoveChargesEffect({
					target: 'defender',
					amount: variants.values(1 as ScalarExpressionType, result)
				})
			]
		})
	]
}));
