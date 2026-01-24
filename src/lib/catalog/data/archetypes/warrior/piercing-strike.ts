import { Action } from '$lib/catalog/models/action';
import { TriggerAttackEffect } from '$lib/catalog/models/effects';
import { Skill } from '$lib/catalog/models/skill';
import piercing from '../../properties/piercing';

export default new Skill({
	title: {
		ca: 'Atac penetrant',
		es: 'Ataque penetrante',
		en: 'Piercing strike'
	},
	xpCost: 0,
	discardReward: {
		agility: 2
	},
	capabilities: [
		new Action({
			cost: { agility: 1 },
			effects: [
				new TriggerAttackEffect({
					properties: [piercing.with({ value: 1 })]
				})
			]
		})
	]
});
