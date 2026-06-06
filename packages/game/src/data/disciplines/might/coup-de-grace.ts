import { Action } from '../../../models/capabilities';
import { drawCards, wound } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { and, distance, eq, lte } from '../../../models/expressions';
import { remainingWounds } from '../../../models/expressions/scalar/wounds';
import { upgradable } from '../../../models/upgrades';
import piercing from '../../properties/piercing';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Cop de gràcia',
		es: 'Golpe de gracia',
		en: 'Coup de grace'
	},
	xpCost: variants.values(0, 1),
	discardReward: { agility: 1 },
	capabilities: [
		new Action({
			id: 'activate',
			effects: [
				wound({
					target: {
						type: 'enemy',
						condition: and(eq(distance, 0), lte(remainingWounds, 2))
					},
					damage: 2,
					properties: [piercing.with({ value: 4 })]
				}),
				...variants.ifMatches(2, drawCards(1))
			]
		})
	]
}));
