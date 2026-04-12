import { Opportunity } from '../../../models/capabilities';
import { modifyRoll } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import {
	reactivePlayerIsNotActivePlayer,
	X,
	type ScalarExpressionType
} from '../../../models/expressions';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Ajuda',
		es: 'Ayuda',
		en: 'Helping Hand'
	},
	discardReward: {
		charisma: variants.level
	},
	xpCost: variants.values(0, 1),
	capabilities: [
		new Opportunity({
			triggers: [{ event: 'beforeDrawingFate', condition: reactivePlayerIsNotActivePlayer }],
			cost: { charisma: variants.values<ScalarExpressionType>(2, X) },
			effects: [modifyRoll(variants.values<ScalarExpressionType>(2, X))]
		})
	]
}));
