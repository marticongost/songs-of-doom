import { Constant } from '$lib/catalog/models/constant';
import { ChangeStatsEffect } from '$lib/catalog/models/effects';
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
		})
	]
});
