import { Archetype } from '$lib/catalog/models/archetype';
import { Action } from '$lib/catalog/models/capabilities';
import { AttackEffect } from '$lib/catalog/models/effects';
import { strength } from '$lib/catalog/models/stats';
import standard from '../../properties/standard';

export default new Archetype({
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
		})
	]
});
