import { Opportunity } from '../../../models/capabilities';
import { negateDamage, removeCharges } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import type { ScalarExpressionType } from '../../../models/expressions';
import { reactivePlayerIsSubject, result } from '../../../models/expressions';
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
			id: 'activate',
			triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }],
			cost: {
				strength: 2
			},
			effects: [
				negateDamage(),
				removeCharges({
					target: 'defender',
					amount: variants.values(1 as ScalarExpressionType, result)
				})
			]
		})
	]
}));
