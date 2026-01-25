import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Estabornir',
		es: 'Aturdir',
		en: 'Stun'
	},
	xpCost: 0,
	discardReward: { strength: 1 }
	// TODO: Opportunity, remove charges from enemy if attack was successful
});
