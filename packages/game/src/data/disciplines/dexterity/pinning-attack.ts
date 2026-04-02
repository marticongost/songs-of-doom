import { Action, Constant, Obligation } from '../../../models/capabilities';
import {
	addCharges,
	attach,
	conferProperties,
	discard,
	removeCharges,
	resultsTable,
	triggerAttack
} from '../../../models/effects';
import { charges, eq } from '../../../models/expressions';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';
import { immobilized } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Atac immobilitzant',
		es: 'Ataque inmobilizante',
		en: 'Pinning attack'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: [
		new Action({
			cost: { agility: 2 },
			effects: [
				triggerAttack({
					modifiers: [
						resultsTable({
							'2+': [attach({ target: 'defender' }), addCharges(variants.level)]
						})
					]
				})
			]
		})
	],
	attachmentCapabilities: [
		new Constant({ effects: [conferProperties([immobilized])] }),
		new Obligation({
			triggers: ['turnEnd'],
			effects: [removeCharges({ amount: 1 }), eq(charges, 0).then(discard())]
		})
	]
}));
