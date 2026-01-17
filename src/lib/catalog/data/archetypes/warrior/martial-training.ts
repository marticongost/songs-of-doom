import { ModifyCapabilityCostEffect } from '$lib/catalog/models/effects';
import { Reaction } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Entrenament Marcial',
		es: 'Entrenamiento Marcial',
		en: 'Martial Training'
	},
	xpCost: 3,
	capabilities: [
		new Reaction({
			triggers: ['payingCapability'],
			cost: {
				cardTransition: 'exhaust'
			},
			effects: [
				new ModifyCapabilityCostEffect({
					cost: {
						strength: -1
					}
				})
			]
		})
	]
});
