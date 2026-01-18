import { ModifyRollEffect } from '$lib/catalog/models/effects';
import { Obligation } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Bàrbar',
		es: 'Bárbaro',
		en: 'Barbarian'
	},
	xpCost: 5,
	capabilities: [
		new Obligation({
			triggers: ['attacking'],
			effects: [
				new ModifyRollEffect({
					modifier: 1
				})
			]
		}),
		new Obligation({
			triggers: ['receivingAttack'],
			effects: [
				new ModifyRollEffect({
					modifier: -1
				})
			]
		})
	]
});
