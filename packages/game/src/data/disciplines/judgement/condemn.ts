import { Action, Constant } from '../../../models/capabilities';
import { attach, conferProperties } from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';
import { holy, vulnerable } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Condemnar',
		es: 'Condenar',
		en: 'Condemn'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Action({
			cost: { will: 2 },
			fast: true,
			effects: [attach()]
		})
	],
	attachmentCapabilities: [
		new Constant({
			effects: [conferProperties([vulnerable.with({ attackType: holy, value: 1 })])]
		})
	]
}));
