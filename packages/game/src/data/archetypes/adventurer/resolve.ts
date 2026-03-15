import { Opportunity } from '../../../models/capabilities';
import { DrawCardsEffect } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';

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
