import { Archetype } from '../../../models/entities/archetype';
import { Action } from '../../../models/capabilities';
import { AttackEffect, equip, InvestigateEffect, move } from '../../../models/effects';
import { intelligence, strength } from '../../../models/stats';
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
				agility: 1
			},
			effects: [move]
		}),
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
		}),
		new Action({
			cost: {
				intelligence: 1
			},
			effects: [
				new InvestigateEffect({
					expression: intelligence,
					results: { '1-2': 1, 3: 2 }
				})
			]
		}),
		new Action({
			effects: [equip]
		})
	]
});
