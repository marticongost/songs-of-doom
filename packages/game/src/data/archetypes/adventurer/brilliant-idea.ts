import { reactivePlayerIsSubject } from '../../..';
import { Opportunity } from '../../../models/capabilities';
import { modifyGatheredClues, resultsTable } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Idea brillant',
		es: 'Idea brillante',
		en: 'Brilliant Idea'
	},
	xpCost: variants.values(0, 1),
	discardReward: { intelligence: variants.values(1, 2) },
	capabilities: [
		new Opportunity({
			id: 'activate',
			triggers: [{ event: 'investigation', condition: reactivePlayerIsSubject }],
			cost: { intelligence: 1 },
			effects: [
				resultsTable({
					[variants.values('3', '2+')]: [modifyGatheredClues(1)]
				})
			]
		})
	]
}));
