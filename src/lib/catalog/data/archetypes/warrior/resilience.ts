import { ChangeStatsEffect } from '$lib/catalog/models/effects';
import { Obligation } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Fortalesa',
		es: 'Fortaleza',
		en: 'Resilience'
	},
	xpCost: 3,
	capabilities: [
		new Obligation({
			triggers: ['acquired'],
			effects: [new ChangeStatsEffect({ health: 2 })]
		})
	]
});
