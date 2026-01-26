import { ChangeStatsEffect } from '$lib/catalog/models/effects';
import { Obligation } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Reflexos ràpids',
		es: 'Reflejos rápidos',
		en: 'Quick reflexes'
	},
	xpCost: 3,
	capabilities: [
		new Obligation({
			triggers: ['acquired'],
			effects: [
				new ChangeStatsEffect({
					agility: 1
				})
			]
		})
	]
});
