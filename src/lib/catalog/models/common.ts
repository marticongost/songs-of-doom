import type { CapabilityCostProps } from './capabilitycost';
import { ModifyCapabilityCostEffect } from './effects';
import { RechargeEffect } from './effects/recharge';
import { Reaction } from './reaction';

export const fullyRechargeOnChapterStart = new Reaction({
	triggers: ['chapterStart'],
	effects: [new RechargeEffect({ amount: 'max' })]
});

export const reduceCostByDiscarding = (cost: CapabilityCostProps) => {
	return new Reaction({
		triggers: ['payingCapability'],
		cost: { cardTransition: 'discard' },
		effects: [new ModifyCapabilityCostEffect({ cost })]
	});
};
