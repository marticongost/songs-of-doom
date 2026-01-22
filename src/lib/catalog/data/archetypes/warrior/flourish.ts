import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Floritura',
		es: 'Floritura',
		en: 'Flourish'
	},
	xpCost: 0,
	discardReward: { agility: 1 }
	// TODO: add charges to an asset
});
