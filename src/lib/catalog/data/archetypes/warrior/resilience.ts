import { Constant } from '$lib/catalog/models/constant';
import { ChangeStatsEffect } from '$lib/catalog/models/effects';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Fortalesa',
		es: 'Fortaleza',
		en: 'Resilience'
	},
	xpCost: 3,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ health: 2 })]
		})
	]
});
