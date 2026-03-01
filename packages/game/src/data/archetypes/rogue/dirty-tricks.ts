import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Jugar brut',
		es: 'Jugar sucio',
		en: 'Dirty tricks'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: []
}));
