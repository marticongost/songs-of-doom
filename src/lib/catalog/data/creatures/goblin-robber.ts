import { Creature } from '$lib/catalog/models/creature';

export default new Creature({
	title: {
		ca: 'Lladre goblin',
		es: 'Ladrón goblin',
		en: 'Goblin robber'
	},
	stats: {
		agility: 3,
		strength: 2,
		intelligence: 3,
		charisma: 2,
		will: 2,
		health: 3
	}
});
