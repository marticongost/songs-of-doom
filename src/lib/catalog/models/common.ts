import { RechargeEffect } from './effects/recharge';
import { Reaction } from './reaction';

export const fullyRechargeOnChapterStart = new Reaction({
	triggers: ['chapterStart'],
	effects: [new RechargeEffect({ amount: 'max' })]
});
