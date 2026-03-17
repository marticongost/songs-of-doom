import { Obligation } from '../../../../models/capabilities';
import {
	discardFromHand,
	drawCards,
	playStoryCards,
	proficiencyTable,
	setRollResult
} from '../../../../models/effects';
import { Scenario } from '../../../../models/entities/scenario';
import audienceWithTheDuke from './audience-with-the-duke';

export default new Scenario({
	title: {
		ca: 'Un llegat trencat',
		es: 'Un legado roto',
		en: 'A broken legacy'
	},
	sigils: {
		twist: [
			proficiencyTable({
				'4+': [setRollResult(2)],
				'2-3': [setRollResult(1)],
				'1': [setRollResult(0)]
			}),
			discardFromHand({ amount: 1 }),
			drawCards(1)
		],
		peril: [
			proficiencyTable({
				'6+': [setRollResult(2)],
				'4-5': [setRollResult(1)],
				'1-3': [setRollResult(0)]
			})
		],
		portent: [
			proficiencyTable({
				'4+': [setRollResult(1)],
				'1-3': [setRollResult(0)]
			})
		],
		despair: [
			proficiencyTable({
				'3+': [setRollResult(0)],
				'1-2': [setRollResult('CF')]
			})
		]
	},
	capabilities: [
		new Obligation({
			triggers: ['scenarioStart'],
			effects: [playStoryCards([audienceWithTheDuke])]
		})
	]
});
