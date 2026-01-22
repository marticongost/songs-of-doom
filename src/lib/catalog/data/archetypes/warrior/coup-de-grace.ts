import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Cop de gràcia',
		es: 'Golpe de gracia',
		en: 'Coup de grace'
	},
	xpCost: 0,
	discardReward: { strength: 1 }
	// TODO: Atac +2 against an enemy with wounds >= 50%, no charge cost, draw card if enemy killed by the attack
});
