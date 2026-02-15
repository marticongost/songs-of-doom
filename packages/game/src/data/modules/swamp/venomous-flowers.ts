import { Obligation } from '../../../models/capabilities';
import { DiscardFromHandEffect, TestEffect } from '../../../models/effects';
import { Encounter } from '../../../models/encounter';
import { handSize, minus } from '../../../models/expressions';
import { intelligence } from '../../../models/stats';

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
