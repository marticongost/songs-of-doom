import { Obligation } from '../../../models/capabilities';
import { discardFromHand, test } from '../../../models/effects';
import { Encounter } from '../../../models/entities/encounter';
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
				test({
					expression: minus(intelligence, handSize),
					results: {
						CF: [discardFromHand({ amount: 2, selection: 'random' })],
						0: [discardFromHand({ amount: 1, selection: 'random' })]
					}
				})
			]
		})
	]
});
