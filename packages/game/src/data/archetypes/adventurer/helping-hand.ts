import { Opportunity } from '../../../models/capabilities';
import { ModifyRollEffect } from '../../../models/effects';
import { X, type ScalarExpressionType } from '../../../models/expressions';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Ajuda',
		es: 'Ayuda',
		en: 'Helping Hand'
	},
	discardReward: {
		intelligence: variants.level
	},
	xpCost: variants.values(0, 1),
	capabilities: [
		new Opportunity({
			triggers: ['beforeOtherPlayerResolvesTest'],
			cost: { charisma: variants.values<ScalarExpressionType>(2, X) },
			effects: [new ModifyRollEffect({ modifier: variants.values<ScalarExpressionType>(2, X) })]
		})
	]
}));
