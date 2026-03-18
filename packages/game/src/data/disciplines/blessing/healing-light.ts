import { Action } from '../../../models/capabilities';
import { sameLocation } from '../../../models/common';
import { heal } from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { ScalarExpressionType, X } from '../../../models/expressions';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Llum curadora',
		es: 'Luz curadora',
		en: 'Healing Light'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Action({
			cost: { will: variants.values<ScalarExpressionType>(2, X) },
			effects: [
				heal({
					amount: variants.values<ScalarExpressionType>(2, X),
					target: { type: ['player', 'ally'], condition: sameLocation }
				})
			]
		})
	]
}));
