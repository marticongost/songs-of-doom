import { RedrawFateEffect, ResultsTableEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

export default upgradable(Skill, 2, (level: number) => ({
	title: {
		ca: 'Cop de sort',
		es: 'Golpe de suerte',
		en: 'Stroke of luck'
	},
	discardReward: {
		intelligence: level
	},
	xpCost: level === 1 ? 0 : 1,
	capabilities: [
		new Opportunity({
			triggers: ['fateDrawn'],
			cost: { any: 1 },
			effects: [
				level === 1
					? new ResultsTableEffect({ entries: [{ result: 0, effects: [new RedrawFateEffect()] }] })
					: new RedrawFateEffect()
			]
		})
	]
}));
