import { RechargeEffect } from './effects/recharge';
import { Obligation } from './reaction';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [new RechargeEffect({ amount: 'max' })]
});
