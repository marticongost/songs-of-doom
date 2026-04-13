import { Opportunity } from '../../../models/capabilities';
import { modifyRoll } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import {
	activeCardHasType,
	reactivePlayerIsSubject
} from '../../../models/expressions/boolean/event-context';
import { and } from '../../../models/expressions/boolean/logical';
import type { BooleanExpression } from '../../../models/expressions/boolean/boolean-expression';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Allunyar la foscor',
		es: 'Ahuyentar la oscuridad',
		en: 'Ward off the darkness'
	},
	xpCost: variants.values(0, 1),
	discardReward: { will: variants.values(1, 2) },
	capabilities: [
		new Opportunity({
			triggers: [
				{
					event: 'beforeDrawingFate',
					condition: variants.values<BooleanExpression>(
						and(activeCardHasType('encounter'), reactivePlayerIsSubject),
						activeCardHasType('encounter')
					)
				}
			],
			effects: [modifyRoll(2)]
		})
	]
}));
