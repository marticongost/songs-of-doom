import { events } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState, ProcedureId } from '../../../core/procedure';
import { emitEvent } from '../../core/emitevent';

export type ChapterStartStepId = 'emitChapterStartEvent';

export interface ChapterStartState extends ProcedureState {}

const { define, call, mutateGameState } = instructions<ChapterStartState>();

export const chapterStartPhase = define({
	id: ProcedureId.ChapterStartPhase,
	steps: {
		incrementChapter: mutateGameState((state, game) => {
			game.chapter++;
		}),
		emitChapterStartEvent: call(emitEvent, { eventType: events.chapterStart.type }, (state) => ({
			...state,
			status: 'complete'
		}))
	}
});
