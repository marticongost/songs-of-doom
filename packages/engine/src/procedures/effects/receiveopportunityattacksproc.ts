import type { ReceiveOpportunityAttacksEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type ReceiveOpportunityAttacksEffectState =
	EffectProcedureState<ReceiveOpportunityAttacksEffect>;

const { define } = instructions<ReceiveOpportunityAttacksEffectState>();

export const receiveOpportunityAttacksEffectProc = define({
	id: ProcedureId.ReceiveOpportunityAttacksEffect,
	steps: {
		compute: (state) => state
	}
});
