import { DefendEffect } from '$lib/catalog/models/effects';
import { Reaction } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';
import standard from '../../properties/standard';

export default new Trait({
	title: {
		ca: 'Aventurer',
		es: 'Aventurero',
		en: 'Adventurer'
	},
	properties: [standard],
	capabilities: [
		new Reaction({
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					expression: 'agility-1'
				})
			]
		})
	]
});
