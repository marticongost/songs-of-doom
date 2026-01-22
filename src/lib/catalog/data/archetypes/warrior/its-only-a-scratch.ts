import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Només és una rascada',
		es: 'Es solo un rasguño',
		en: "It's only a scratch"
	},
	xpCost: 0,
	discardReward: { strength: 1, will: 1 }
	// TODO: cost: pain X, draw X cards, draw X aptitudes
});
