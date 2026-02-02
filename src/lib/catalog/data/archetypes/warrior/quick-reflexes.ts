import { Constant } from '$lib/catalog/models/constant';
import { ChangeStatsEffect, DefendEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Reflexos ràpids',
		es: 'Reflejos rápidos',
		en: 'Quick reflexes'
	},
	xpCost: 3,
	capabilities: [
		new Constant({
			effects: [
				new ChangeStatsEffect({
					agility: 1
				})
			]
		}),
		new Opportunity({
			triggers: ['receivingAttack'],
			cost: { agility: 1 },
			effects: [
				new DefendEffect({
					expression: 1
				})
			]
		})
	]
});
