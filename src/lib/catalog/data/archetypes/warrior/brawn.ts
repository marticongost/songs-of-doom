import { Constant } from '$lib/catalog/models/capabilities';
import { ChangeStatsEffect } from '$lib/catalog/models/effects';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Corpulència',
		es: 'Corpulencia',
		en: 'Brawn'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ strength: 1 })]
		})
	]
});
