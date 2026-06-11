import { events } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import { emitEvent } from '../../core/emitevent';

export type ChapterEndStepId = 'emitChapterEndEvent' | 'readyCards';

export interface ChapterEndState extends ProcedureState {}

const { define, call, mutateGameState } = instructions<ChapterEndState>();

export const chapterEndPhase = define({
	id: ProcedureId.ChapterEndPhase,
	steps: {
		emitChapterEndEvent: call(emitEvent, { eventType: events.chapterEnd.type }, (state) => ({
			...state,
			step: 'readyCards'
		})),
		readyCards: mutateGameState((state, game) => {
			for (const card of game.cards()) {
				card.exhausted = false;
			}
		})
	}
});
