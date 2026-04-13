import { reactivePlayerIsSubject } from '../../../..';
import { Opportunity } from '../../../../models/capabilities';
import { drawCards } from '../../../../models/effects';
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
			triggers: [{ event: 'enemyDefeated', condition: reactivePlayerIsSubject }],
			cost: {
				cardTransition: 'exhaust'
			},
			effects: [
				drawCards({
					amount: 1
				})
			]
		})
	]
});
