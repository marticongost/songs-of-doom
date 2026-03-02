import { Archetype } from '../../../models/archetype';
import { Opportunity } from '../../../models/capabilities';
import { TransformFocusEffect } from '../../../models/effects';

export default new Archetype({
	title: {
		ca: 'Lladre',
		es: 'Ladrón',
		en: 'Rogue'
	},
	xpCost: 5,
	disciplines: ['dexterity', 'guile', 'security'],
	capabilities: [
		new Opportunity({
			triggers: ['payingCapability'],
			cost: { cardTransition: 'exhaust' },
			effects: [
				new TransformFocusEffect({
					target: 'agility'
				})
			]
		})
	]
});
