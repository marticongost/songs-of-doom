import { ChangeStatsEffect } from '$lib/catalog/models/effects';
import { Reaction } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Guerrer',
		es: 'Guerrero',
		en: 'Warrior'
	},
	xpCost: 5,
	capabilities: [
		new Reaction({
			triggers: ['acquired'],
			effects: [
				new ChangeStatsEffect({
					strength: 1,
					health: 2
				})
			]
		})
	]
});
