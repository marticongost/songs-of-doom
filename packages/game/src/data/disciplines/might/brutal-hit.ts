import { Opportunity } from '../../../models/capabilities';
import { modifyDamage, resultsTable } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { reactivePlayerIsSubject } from '../../../models/expressions';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Impacte brutal',
		es: 'Impacto brutal',
		en: 'Brutal hit'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		strength: variants.values(2, 3)
	},
	capabilities: [
		new Opportunity({
			triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }],
			cost: { strength: 1 },
			effects: [
				resultsTable({
					entries: [{ result: '2+', effects: [modifyDamage(variants.values(1, 2))] }]
				})
			]
		})
	]
}));
