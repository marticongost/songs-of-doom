import { events } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';

export type ChapterStartStepId = 'emitChapterStartEvent';

export interface ChapterStartState extends ProcedureState {}

const { define, emitEvent, mutateGameState } = instructions<ChapterStartState>();

export const chapterStartPhase = define({
	id: ProcedureId.ChapterStartPhase,
	steps: {
		incrementChapter: mutateGameState((_state, game) => {
			game.chapter++;
		}),
		emitChapterStartEvent: emitEvent({ eventType: events.chapterStart.type })
	}
});
