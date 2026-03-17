import { Constant, Opportunity } from '../../../models/capabilities';
import { talent, transformFocus } from '../../../models/effects';
import { Archetype } from '../../../models/entities';
import { lightArmour, mediumArmour } from '../../talents';

export default new Archetype({
	title: {
		ca: 'Sacerdot',
		es: 'Sacerdote',
		en: 'Priest'
	},
	disciplines: ['might', 'endurance', 'blessing', 'judgement'],
	xpCost: 5,
	capabilities: [
		new Constant({
			effects: [talent([lightArmour, mediumArmour])]
		}),
		new Opportunity({
			triggers: ['payingCapability'],
			cost: { cardTransition: 'exhaust' },
			effects: [
				transformFocus({
					target: 'will'
				})
			]
		})
	]
});
