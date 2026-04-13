import { reactivePlayerIsSubject } from '../../..';
import { Constant, Opportunity } from '../../../models/capabilities';
import { talent, transformFocus } from '../../../models/effects';
import { Archetype } from '../../../models/entities/archetype';
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
			effects: [talent([lightArmour])]
		}),
		new Opportunity({
			triggers: [{ event: 'payingCapability', condition: reactivePlayerIsSubject }],
			cost: { cardTransition: 'exhaust' },
			effects: [
				transformFocus({
					target: 'agility'
				})
			]
		})
	]
});
