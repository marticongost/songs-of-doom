import { Opportunity } from '../../../models/capabilities';
import { conferProperties, triggerAttack } from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { ScalarExpressionType, X } from '../../../models/expressions';
import { upgradable } from '../../../models/upgrades';
import { disruption, holy, invulnerable } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: "L'escut contra la foscor",
		es: 'El escudo contra la oscuridad',
		en: 'Shield Against the Dark'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Opportunity({
			triggers: ['receivingAttack'],
			cost: { will: variants.values<ScalarExpressionType>(2, X) },
			effects: [
				conferProperties([
					invulnerable.with({ value: variants.values<ScalarExpressionType>(2, X) })
				]),
				triggerAttack({
					modifiers: [conferProperties([holy, disruption.with({ value: X })])]
				})
			]
		})
	]
}));
