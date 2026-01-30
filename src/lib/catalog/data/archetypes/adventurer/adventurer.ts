import { Action } from '$lib/catalog/models/action';
import { AttackEffect, DefendEffect } from '$lib/catalog/models/effects';
import { minus } from '$lib/catalog/models/expressions';
import { Opportunity } from '$lib/catalog/models/reaction';
import { agility, strength } from '$lib/catalog/models/stats';
import { Trait } from '$lib/catalog/models/trait';
import standard from '../../properties/standard';

export default new Trait({
	title: {
		ca: 'Aventurer',
		es: 'Aventurero',
		en: 'Adventurer'
	},
	properties: [standard],
	capabilities: [
		new Action({
			cost: {
				strength: 1
			},
			effects: [
				new AttackEffect({
					expression: strength,
					damage: { 1: 1, 2: 2, 3: 3 }
				})
			]
		}),
		new Opportunity({
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					expression: minus(agility, 1)
				})
			]
		})
	]
});
