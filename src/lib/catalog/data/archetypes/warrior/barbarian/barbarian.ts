import { Archetype } from '$lib/catalog/models/archetype';
import { ModifyRollEffect } from '$lib/catalog/models/effects';
import { Obligation } from '$lib/catalog/models/reaction';

export default new Archetype({
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
