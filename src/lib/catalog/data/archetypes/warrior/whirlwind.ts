import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: "Remolí d'atacs",
		es: 'Remolino de ataques',
		en: 'Whirlwind'
	},
	xpCost: 2,
	discardReward: { agility: 2 }
	// TODO: As long as the attack is successful, keep attacking
});
