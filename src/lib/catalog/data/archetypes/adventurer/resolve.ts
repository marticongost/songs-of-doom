import { DrawCardsEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Determinació',
		es: 'Determinación',
		en: 'Resolve'
	},
	discardReward: {
		heroism: 1
	},
	capabilities: [
		new Opportunity({
			triggers: ['chapterStart'],
			effects: [new DrawCardsEffect({ amount: 1 })]
		})
	]
});
