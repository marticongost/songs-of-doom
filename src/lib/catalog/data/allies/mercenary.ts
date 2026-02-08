import { Ally } from '$lib/catalog/models/ally';

export default new Ally({
	title: {
		ca: 'Mercenari',
		es: 'Mercenario',
		en: 'Mercenary'
	},
	stats: {
		strength: 4,
		agility: 3,
		intelligence: 3,
		charisma: 2,
		will: 2,
		health: 7,
		sanity: 5
	}
});
