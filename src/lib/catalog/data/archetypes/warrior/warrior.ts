import { Archetype } from '$lib/catalog/models/archetype';
import { TransformFocusEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';

export default new Archetype({
	title: {
		ca: 'Guerrer',
		es: 'Guerrero',
		en: 'Warrior'
	},
	xpCost: 5,
	capabilities: [
		new Opportunity({
			triggers: ['payingCapability'],
			cost: { cardTransition: 'exhaust' },
			effects: [
				new TransformFocusEffect({
					target: 'strength'
				})
			]
		})
	]
});
