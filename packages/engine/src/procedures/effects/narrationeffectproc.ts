import type { NarrationEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EffectProcedureState } from '../core/triggereffect';

export type NarrationEffectState = EffectProcedureState<NarrationEffect>;

const { define } = instructions<NarrationEffectState>();

/**
 * Procedure for {@link NarrationEffect}.
 *
 * The engine does **not** pause for narration. This procedure produces a single
 * journal entry carrying the narration text and immediately auto-advances to
 * the next step. It is the client's responsibility to pace journal presentation
 * so that each player can read the narration at their own speed before
 * subsequent entries are revealed.
 */
export const narrationEffectProc = define({
	id: ProcedureId.NarrationEffect,
	steps: {
		// Narration has no game-state side effects. The journal entry
		// produced by this step carries the effect's localised text in
		// state.effect.text, which the client uses to render the narration.
		record: (state) => state
	}
});
