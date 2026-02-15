import { Obligation } from '../../../models/capabilities';
import { GoTowardsEffect, TestEffect } from '../../../models/effects';
import { Encounter } from '../../../models/encounter';
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
				new TestEffect({
					expression: strength,
					results: {
						failed: [new GoTowardsEffect({ destination: { type: 'enemy', selection: 'closest' } })]
					}
				})
			]
		})
	]
});
