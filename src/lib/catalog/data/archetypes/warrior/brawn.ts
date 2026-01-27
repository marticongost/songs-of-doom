import { ChangeStatsEffect } from '$lib/catalog/models/effects';
import { Obligation } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Corpulència',
		es: 'Corpulencia',
		en: 'Brawn'
	},
	xpCost: 4,
	capabilities: [
		new Obligation({
			triggers: ['acquired'],
			effects: [new ChangeStatsEffect({ strength: 1 })]
		})
	]
});
