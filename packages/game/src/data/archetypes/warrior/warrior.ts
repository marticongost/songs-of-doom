import { Archetype } from '../../../models/entities/archetype';
import { Constant, Opportunity } from '../../../models/capabilities';
import { TalentEffect, TransformFocusEffect } from '../../../models/effects';
import { lightArmour, mediumArmour } from '../../talents';

export default new Archetype({
	title: {
		ca: 'Guerrer',
		es: 'Guerrero',
		en: 'Warrior'
	},
	disciplines: ['might', 'dexterity', 'endurance'],
	xpCost: 5,
	capabilities: [
		new Constant({
			effects: [new TalentEffect({ talents: [lightArmour, mediumArmour] })]
		}),
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
