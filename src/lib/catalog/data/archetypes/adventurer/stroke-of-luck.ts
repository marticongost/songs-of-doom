import { RedrawFateEffect, ResultsTableEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Cop de sort',
		es: 'Golpe de suerte',
		en: 'Stroke of luck'
	},
	discardReward: {
		intelligence: 1
	},
	capabilities: [
		new Opportunity({
			triggers: ['fateDrawn'],
			cost: { any: 1 },
			effects: [
				new ResultsTableEffect({ entries: [{ result: 0, effects: [new RedrawFateEffect()] }] })
			]
		})
	]
});
