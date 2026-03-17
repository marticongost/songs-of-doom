import { Obligation } from '../../../models/capabilities';
import { sanityLoss, test } from '../../../models/effects';
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
				test({
					expression: will,
					results: {
						CF: [sanityLoss(2)],
						0: [sanityLoss(1)]
					}
				})
			]
		})
	]
});
