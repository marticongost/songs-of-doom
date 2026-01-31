import { TriggerAttackEffect } from './effects';
import { RechargeEffect } from './effects/recharge';
import { Obligation, Opportunity } from './reaction';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [new RechargeEffect({ amount: 'max' })]
});

export const shootBeforeEngaged = new Opportunity({
	triggers: ['beforeEnemyEngagesWithSelf'],
	effects: [
		new TriggerAttackEffect({
			card: 'this'
		})
	]
});
