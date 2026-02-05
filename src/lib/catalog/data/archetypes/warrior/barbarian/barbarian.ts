import { Archetype } from '$lib/catalog/models/archetype';
import { Obligation } from '$lib/catalog/models/capabilities';
import { ModifyRollEffect } from '$lib/catalog/models/effects';

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
