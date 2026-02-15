import { Archetype } from '../../../models/archetype';
import { Opportunity } from '../../../models/capabilities';
import { TransformFocusEffect } from '../../../models/effects';

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
