import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Atac exposat',
		es: 'Ataque expuesto',
		en: 'Exposed attack'
	},
	xpCost: 0,
	discardReward: {
		agility: 1
	}
	// TODO: atac +2, si falla, l'oponent ataca amb +1 sense cost
});
