import { Ally } from '$lib/catalog/models/ally';
import follower from '../properties/follower';

export default new Ally({
	title: {
		ca: 'Mag embogit',
		es: 'Mago enloquecido',
		en: 'Mad Wizard'
	},
	properties: [follower],
	stats: {
		strength: 2,
		agility: 2,
		intelligence: 4,
		charisma: 2,
		will: 4,
		health: 4,
		sanity: 6
	}
});
