import { Opportunity } from '../../../models/capabilities';
import { drawCards } from '../../../models/effects';
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
			id: 'activate',
			triggers: ['chapterStart'],
			effects: [drawCards(1)]
		})
	]
});
