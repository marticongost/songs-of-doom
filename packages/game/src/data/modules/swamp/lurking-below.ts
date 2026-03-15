import { Obligation } from '../../../models/capabilities';
import { SanityLossEffect, TestEffect } from '../../../models/effects';
import { Encounter } from '../../../models/entities/encounter';
import { will } from '../../../models/stats';

export default new Encounter({
	title: {
		ca: 'Voltant a les profunditats',
		es: 'Vagando por las profundidades',
		en: 'Lurking below'
	},
	capabilities: [
		new Obligation({
			triggers: ['revealed'],
			effects: [
				new TestEffect({
					expression: will,
					results: {
						CF: [new SanityLossEffect({ amount: 2 })],
						0: [new SanityLossEffect({ amount: 1 })]
					}
				})
			]
		})
	]
});
