import { DrawCardsEffect } from '$lib/catalog/models/effects';
import { Reaction } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Sed de Sang',
		es: 'Sed de Sangre',
		en: 'Bloodlust'
	},
	xpCost: 2,
	capabilities: [
		new Reaction({
			triggers: ['enemyDefeated'],
			cost: {
				cardTransition: 'exhaust'
			},
			effects: [
				new DrawCardsEffect({
					amount: 1
				})
			]
		})
	]
});
