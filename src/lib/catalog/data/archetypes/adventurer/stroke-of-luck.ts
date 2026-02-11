import { Opportunity } from '$lib/catalog/models/capabilities';
import { redrawFate, ResultsTableEffect } from '$lib/catalog/models/effects';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

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
				[new ResultsTableEffect({ entries: [{ result: 0, effects: [redrawFate] }] })],
				[...variants.ifMatches(2, redrawFate)]
			)
		})
	]
}));
