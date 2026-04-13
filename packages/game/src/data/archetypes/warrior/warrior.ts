import { reactivePlayerIsSubject } from '../../..';
import { Constant, Opportunity } from '../../../models/capabilities';
import { talent, transformFocus } from '../../../models/effects';
import { Archetype } from '../../../models/entities/archetype';
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
			effects: [talent([lightArmour, mediumArmour])]
		}),
		new Opportunity({
			triggers: [{ event: 'payingCapability', condition: reactivePlayerIsSubject }],
			cost: { cardTransition: 'exhaust' },
			effects: [
				transformFocus({
					target: 'strength'
				})
			]
		})
	]
});
