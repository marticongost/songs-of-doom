import { Counter } from '@songsofdoom/common';
import type { GatherCluesEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { LocationId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface GatherCluesEffectState extends EffectProcedureState<GatherCluesEffect> {
	/** The resolved target location IDs from the target resolution step. */
	locationIds: LocationId[];

	/** How many clues were gathered from each location. */
	gatheredClues: Counter<LocationId>;
}

const { define, resolveTargetList, mutateGameState } = instructions<GatherCluesEffectState>();

export const gatherCluesEffectProc = define({
	id: ProcedureId.GatherCluesEffect,
	steps: {
		resolveTargets: resolveTargetList(({ effect }) => effect.target, 'locationIds'),
		gather: mutateGameState((state, game) => {
			const amount = game.evaluateScalar(state.effect.amount);
			const subject = game.requireSubject();
			state.gatheredClues = new Counter<LocationId>();

			for (const locationId of state.locationIds) {
				const location = game.requireCard(locationId);
				const cluesGathered = Math.min(amount, location.clues);
				location.clues -= cluesGathered;
				subject.clues += cluesGathered;
				state.gatheredClues.add(locationId, cluesGathered);
			}
		})
	}
});
