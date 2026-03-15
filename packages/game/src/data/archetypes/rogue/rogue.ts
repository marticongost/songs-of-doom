import { Archetype } from '../../../models/entities/archetype';
import { Constant, Opportunity } from '../../../models/capabilities';
import { TalentEffect, TransformFocusEffect } from '../../../models/effects';
import { lightArmour } from '../../talents';

export default new Archetype({
	title: {
		ca: 'Lladre',
		es: 'Ladrón',
		en: 'Rogue'
	},
	xpCost: 5,
	disciplines: ['dexterity', 'guile', 'security'],
	capabilities: [
		new Constant({
			effects: [new TalentEffect({ talents: [lightArmour] })]
		}),
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
