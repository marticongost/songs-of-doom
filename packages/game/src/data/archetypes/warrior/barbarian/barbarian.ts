import { Obligation } from '../../../../models/capabilities';
import { modifyRoll } from '../../../../models/effects';
import { Archetype } from '../../../../models/entities/archetype';
import { reactivePlayerIsSubject, reactivePlayerIsTarget } from '../../../../models/expressions';

export default new Archetype({
	title: {
		ca: 'Bàrbar',
		es: 'Bárbaro',
		en: 'Barbarian'
	},
	xpCost: 5,
	capabilities: [
		new Obligation({
			id: 'passive',
			triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }],
			effects: [
				modifyRoll({
					modifier: 1
				})
			]
		}),
		new Obligation({
			id: 'activate',
			triggers: [{ event: 'attack', condition: reactivePlayerIsTarget }],
			effects: [
				modifyRoll({
					modifier: 1
				})
			]
		})
	]
});
