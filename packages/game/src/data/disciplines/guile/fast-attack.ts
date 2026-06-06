import { Action } from '../../../models/capabilities';
import { modifyRoll, triggerAttack } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Atac precipitat',
		es: 'Ataque apresurado',
		en: 'Fast attack'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: [
		new Action({
			id: 'activate',
			fast: true,
			effects: [
				triggerAttack({
					modifiers: [modifyRoll(-1)]
				})
			]
		})
	]
}));
