import { Action } from '$lib/catalog/models/action';
import { WoundEffect } from '$lib/catalog/models/effects';
import { and, distance, eq, lte } from '$lib/catalog/models/expressions';
import { remainingWounds } from '$lib/catalog/models/expressions/wounded';
import { Skill } from '$lib/catalog/models/skill';
import piercing from '../../properties/piercing';

export default new Skill({
	title: {
		ca: 'Cop de gràcia',
		es: 'Golpe de gracia',
		en: 'Coup de grace'
	},
	xpCost: 0,
	discardReward: { agility: 1 },
	capabilities: [
		new Action({
			effects: [
				new WoundEffect({
					target: {
						type: 'enemy',
						condition: and(eq(distance, 0), lte(remainingWounds, 2))
					},
					damage: 2,
					properties: [piercing.with({ value: 4 })]
				})
			]
		})
	]
});
