import { Opportunity } from '../../../models/capabilities';
import { negateDamage, RemoveChargesEffect } from '../../../models/effects';
import type { ScalarExpressionType } from '../../../models/expressions';
import { result } from '../../../models/expressions';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';

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
