import { Obligation } from '$lib/catalog/models/capabilities';
import { GoTowardsEffect, TestEffect } from '$lib/catalog/models/effects';
import { Encounter } from '$lib/catalog/models/encounter';
import { strength } from '$lib/catalog/models/stats';

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
