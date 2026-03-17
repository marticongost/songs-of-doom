import { Opportunity } from '../../../models/capabilities';
import { drawCards, drawFocus, resultsTable } from '../../../models/effects';
import { addCharges } from '../../../models/effects/recharge';
import { and, owned } from '../../../models/expressions';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';
import weapon from '../../properties/weapon';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Floritura',
		es: 'Floritura',
		en: 'Flourish'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: { agility: 2 },
			effects: [
				resultsTable({
					entries: [
						{
							result: '2+',
							effects: [
								addCharges({
									amount: 1,
									target: {
										type: 'object',
										condition: and(owned, weapon)
									}
								}),
								drawFocus(1),
								...variants.ifMatches(2, drawCards(1))
							]
						}
					]
				})
			]
		})
	]
}));
