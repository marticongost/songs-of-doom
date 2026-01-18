import type { CapabilityCostProps } from './capabilitycost';
import { ModifyCapabilityCostEffect } from './effects';
import { RechargeEffect } from './effects/recharge';
import { Obligation, Opportunity } from './reaction';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [new RechargeEffect({ amount: 'max' })]
});

export const reduceCostByDiscarding = (cost: CapabilityCostProps) => {
	return new Opportunity({
		triggers: ['payingCapability'],
		effects: [new ModifyCapabilityCostEffect({ cost })]
	});
};
