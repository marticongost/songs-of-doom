import { Action } from '$lib/catalog/models/action';
import { WoundedCondition } from '$lib/catalog/models/conditions';
import { SAME_LOCATION } from '$lib/catalog/models/conditions/distance-condition';
import { WoundEffect } from '$lib/catalog/models/effects';
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
						conditions: [
							SAME_LOCATION,
							new WoundedCondition({ wounds: { metric: 'remaining', operator: '<=', value: 2 } })
						]
					},
					damage: 2,
					properties: [piercing.with({ value: 4 })]
				})
			]
		})
	]
});
