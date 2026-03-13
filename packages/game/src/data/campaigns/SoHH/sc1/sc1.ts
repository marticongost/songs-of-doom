import {
	DiscardFromHandEffect,
	DrawCardsEffect,
	ProficiencyTableEffect,
	SetRollResultEffect
} from '../../../../models/effects';
import { Scenario } from '../../../../models/scenario';

export default new Scenario({
	title: {
		ca: 'Un llegat trencat',
		es: 'Un legado roto',
		en: 'A broken legacy'
	},
	sigils: {
		twist: [
			new ProficiencyTableEffect({
				'4+': [new SetRollResultEffect({ result: 2 })],
				'2-3': [new SetRollResultEffect({ result: 1 })],
				'1': [new SetRollResultEffect({ result: 0 })]
			}),
			new DiscardFromHandEffect({ amount: 1 }),
			new DrawCardsEffect({ amount: 1 })
		],
		peril: [
			new ProficiencyTableEffect({
				'6+': [new SetRollResultEffect({ result: 2 })],
				'4-5': [new SetRollResultEffect({ result: 1 })],
				'1-3': [new SetRollResultEffect({ result: 0 })]
			})
		],
		portent: [
			new ProficiencyTableEffect({
				'4+': [new SetRollResultEffect({ result: 1 })],
				'1-3': [new SetRollResultEffect({ result: 0 })]
			})
		],
		despair: [
			new ProficiencyTableEffect({
				'3+': [new SetRollResultEffect({ result: 0 })],
				'1-2': [new SetRollResultEffect({ result: 'CF' })]
			})
		]
	}
});
