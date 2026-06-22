import { events } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';

export type ChapterEndStepId = 'emitChapterEndEvent' | 'readyCards';

export interface ChapterEndState extends ProcedureState {}

const { define, emitEvent, mutateGameState } = instructions<ChapterEndState>();

export const chapterEndPhase = define({
	id: ProcedureId.ChapterEndPhase,
	steps: {
		emitChapterEndEvent: emitEvent({ eventType: events.chapterEnd.type }),
		readyCards: mutateGameState((_state, game) => {
			for (const card of game.cards()) {
				card.exhausted = false;
			}
		})
	}
});
