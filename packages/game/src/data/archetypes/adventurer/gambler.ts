import { Action } from '../../../models/capabilities';
import { currentLocation } from '../../../models/common';
import { exhaust, LooseGoldEffect, TestEffect } from '../../../models/effects';
import { and, cash, engaged, gt, is, minus, not } from '../../../models/expressions';
import { will } from '../../../models/stats';
import { Trait } from '../../../models/trait';
import { flaw, town } from '../../properties';

export default new Trait({
	title: { en: 'Gambler', es: 'Adicto al juego', ca: 'Adicte al joc' },
	xpCost: -2,
	properties: [flaw],
	capabilities: [
		new Action({
			prioritary: true,
			effects: [
				and(not(engaged), is(currentLocation, town), gt(cash, 0)).then(
					exhaust,
					new TestEffect({
						expression: minus(will, 1),
						results: {
							CF: [new LooseGoldEffect({ amount: 3 })],
							0: [new LooseGoldEffect({ amount: 1 })]
						}
					})
				)
			]
		})
	]
});
