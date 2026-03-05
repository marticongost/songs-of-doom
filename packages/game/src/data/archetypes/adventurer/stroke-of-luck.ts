import { Opportunity } from '../../../models/capabilities';
import { redrawFate, ResultsTableEffect } from '../../../models/effects';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Cop de sort',
		es: 'Golpe de suerte',
		en: 'Stroke of luck'
	},
	discardReward: {
		intelligence: variants.level
	},
	xpCost: variants.values(0, 1),
	capabilities: [
		new Opportunity({
			triggers: ['fateDrawn'],
			cost: { any: 1 },
			effects: variants.values(
				[new ResultsTableEffect({ entries: [{ result: ['CF', 0], effects: [redrawFate] }] })],
				[...variants.ifMatches(2, redrawFate)]
			)
		})
	]
}));
