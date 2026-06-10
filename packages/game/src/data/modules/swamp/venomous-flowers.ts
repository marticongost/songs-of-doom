import { Obligation } from '../../../models/capabilities';
import { discardFromHand, test } from '../../../models/effects';
import { Encounter } from '../../../models/entities/encounter';
import { handSize, minus, reactiveCardIsSubject } from '../../../models/expressions';
import { intelligence } from '../../../models/stats';

export default new Encounter({
	title: {
		ca: 'Flors emmetzinades',
		es: 'Flores ponzoñosas',
		en: 'Venomous Flowers'
	},
	capabilities: [
		new Obligation({
			id: 'activate',
			triggers: [{ event: 'encounterRevealed', condition: reactiveCardIsSubject }],
			effects: [
				test({
					expression: minus(intelligence, handSize),
					results: {
						CF: [discardFromHand({ cards: { cardinality: 2, selection: 'random' } })],
						0: [discardFromHand({ cards: { cardinality: 1, selection: 'random' } })]
					}
				})
			]
		})
	]
});
