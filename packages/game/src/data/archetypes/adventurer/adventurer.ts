import { Archetype } from '../../../models/archetype';
import { Action } from '../../../models/capabilities';
import { AttackEffect } from '../../../models/effects';
import { strength } from '../../../models/stats';
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
					results: { 1: 1, 2: 2, 3: 3 }
				})
			]
		})
	]
});
