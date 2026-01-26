import { NegateDamageEffect, RemoveChargesEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Estabornir',
		es: 'Aturdir',
		en: 'Stun'
	},
	xpCost: 0,
	discardReward: { strength: 1 },
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: {
				strength: 2
			},
			effects: [
				new NegateDamageEffect(),
				new RemoveChargesEffect({ target: 'defender', amount: 'result' })
			]
		})
	]
	// TODO: Opportunity, remove charges from enemy if attack was successful
});
