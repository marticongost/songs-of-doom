import { reactivePlayerIsSubject } from '../../..';
import { Opportunity } from '../../../models/capabilities';
import { modifyCapabilityCost } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Entrenament Marcial',
		es: 'Entrenamiento Marcial',
		en: 'Martial Training'
	},
	xpCost: 3,
	capabilities: [
		new Opportunity({
			id: 'activate',
			triggers: [{ event: 'payingCapability', condition: reactivePlayerIsSubject }],
			cost: {
				cardTransition: 'exhaust'
			},
			effects: [
				modifyCapabilityCost({
					cost: {
						strength: -1
					}
				})
			]
		})
	]
});
