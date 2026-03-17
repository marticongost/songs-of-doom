import { Obligation } from '../../../models/capabilities';
import { goTowards, test } from '../../../models/effects';
import { Encounter } from '../../../models/entities/encounter';
import { strength } from '../../../models/stats';

export default new Encounter({
	title: {
		ca: 'Fums tòxics',
		es: 'Humos tóxicos',
		en: 'Toxic Fumes'
	},
	capabilities: [
		new Obligation({
			triggers: ['revealed'],
			effects: [
				test({
					expression: strength,
					results: {
						failed: [goTowards({ destination: { type: 'enemy', selection: 'closest' } })]
					}
				})
			]
		})
	]
});
