import { Opportunity } from '../../../models/capabilities';
import { modifyRoll } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { lte } from '../../../models/expressions';
import { remainingWounds } from '../../../models/expressions/scalar/wounds';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: "Ens veurem a l'infern",
		es: 'Nos vemos en el infierno',
		en: 'See you in hell'
	},
	discardReward: {
		will: variants.level
	},
	xpCost: variants.values(0, 1),
	capabilities: [
		new Opportunity({
			triggers: ['beforeDrawingFate'],
			cost: { will: 2 },
			effects: [lte(remainingWounds, 3).then(modifyRoll(variants.values(2, 3)))]
		})
	]
}));
