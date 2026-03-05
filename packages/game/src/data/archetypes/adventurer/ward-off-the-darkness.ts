import { Opportunity } from '../../../models/capabilities';
import { DrawCardsEffect, ModifyRollEffect, ResultsTableEffect } from '../../../models/effects';
import { Skill } from '../../../models/skill';
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
			triggers: ['resolvingEncounter'],
			effects: [
				new ModifyRollEffect({ modifier: 1 }),
				...variants.ifMatches(
					2,
					new ResultsTableEffect({ '2+': [new DrawCardsEffect({ amount: 1 })] })
				)
			]
		})
	]
}));
