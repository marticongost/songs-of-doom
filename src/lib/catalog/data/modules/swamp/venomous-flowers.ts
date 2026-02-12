import { Obligation } from '$lib/catalog/models/capabilities';
import { DiscardFromHandEffect, TestEffect } from '$lib/catalog/models/effects';
import { Encounter } from '$lib/catalog/models/encounter';
import { handSize, minus } from '$lib/catalog/models/expressions';
import { intelligence } from '$lib/catalog/models/stats';

export default new Encounter({
	title: {
		ca: 'Flors emmetzinades',
		es: 'Flores ponzoñosas',
		en: 'Venomous Flowers'
	},
	capabilities: [
		new Obligation({
			triggers: ['revealed'],
			effects: [
				new TestEffect({
					expression: minus(intelligence, handSize),
					results: {
						CF: [new DiscardFromHandEffect({ amount: 2, selection: 'random' })],
						0: [new DiscardFromHandEffect({ amount: 1, selection: 'random' })]
					}
				})
			]
		})
	]
});
