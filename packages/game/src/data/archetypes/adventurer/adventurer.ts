import { Action } from '../../../models/capabilities';
import { attack, equip, investigate, move } from '../../../models/effects';
import { Archetype } from '../../../models/entities/archetype';
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
			id: 'move',
			cost: {
				agility: 1
			},
			effects: [move()]
		}),
		new Action({
			id: 'attack',
			cost: {
				strength: 1
			},
			effects: [
				attack({
					expression: strength,
					results: { 1: 1, 2: 2, 3: 3 }
				})
			]
		}),
		new Action({
			id: 'investigate',
			cost: {
				intelligence: 1
			},
			effects: [
				investigate({
					expression: intelligence,
					results: { '1-2': 1, 3: 2 }
				})
			]
		}),
		new Action({
			id: 'equip',
			effects: [equip()]
		})
	]
});
