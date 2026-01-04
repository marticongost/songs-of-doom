import { ModifyRollEffect } from '$lib/catalog/models/effects';
import { Reaction } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Bàrbar',
		es: 'Bárbaro',
		en: 'Barbarian'
	},
	capabilities: [
		new Reaction({
			triggers: ['attacking', 'defending'],
			effects: [
				new ModifyRollEffect({
					modifier: 1
				})
			]
		})
	]
});
