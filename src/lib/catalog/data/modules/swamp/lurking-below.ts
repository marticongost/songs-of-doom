import { Obligation } from '$lib/catalog/models/capabilities';
import { SanityLossEffect, TestEffect } from '$lib/catalog/models/effects';
import { Encounter } from '$lib/catalog/models/encounter';
import { will } from '$lib/catalog/models/stats';

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
