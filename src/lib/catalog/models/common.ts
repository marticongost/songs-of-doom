import { Obligation, Opportunity } from './capabilities';
import { TriggerAttackEffect } from './effects';
import { AddChargesEffect } from './effects/recharge';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [new AddChargesEffect({ amount: 'max' })]
});

export const shootBeforeEngaged = new Opportunity({
	triggers: ['beforeEnemyEngagesWithSelf'],
	effects: [
		new TriggerAttackEffect({
			card: 'this'
		})
	]
});
