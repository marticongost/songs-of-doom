import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Arma amagada',
		es: 'Arma oculta',
		en: 'Concealed weapon'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: []
}));
