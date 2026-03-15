import { Opportunity } from '../../../../models/capabilities';
import { DrawCardsEffect } from '../../../../models/effects';
import { Trait } from '../../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Sed de Sang',
		es: 'Sed de Sangre',
		en: 'Bloodlust'
	},
	xpCost: 2,
	capabilities: [
		new Opportunity({
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
