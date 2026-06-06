import { Action } from '../../../models/capabilities';
import { exhaust, looseGold, test } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { and, cash, engaged, gt, is, minus, not } from '../../../models/expressions';
import { will } from '../../../models/stats';
import { currentLocation } from '../../../models/target';
import { flaw, town } from '../../properties';

export default new Trait({
	title: { en: 'Gambler', es: 'Adicto al juego', ca: 'Adicte al joc' },
	xpCost: -2,
	properties: [flaw],
	capabilities: [
		new Action({
			id: 'gamble',
			prioritary: true,
			effects: [
				and(not(engaged), is(currentLocation, town), gt(cash, 0)).then(
					exhaust(),
					test({
						expression: minus(will, 1),
						results: {
							CF: [looseGold(3)],
							0: [looseGold(1)]
						}
					})
				)
			]
		})
	]
});
