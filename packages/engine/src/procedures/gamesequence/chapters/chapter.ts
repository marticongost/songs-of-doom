import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import { chapterEndPhase } from './chapterendphase';
import { chapterStartPhase } from './chapterstartphase';
import { drawPhase } from './drawphase';
import { encounterPhase } from './encounterphase';
import { focusPhase } from './focusphase';
import { turnsPhase } from './turnsphase';

export type ChapterStepId =
	| 'chapterStartPhase'
	| 'focusPhase'
	| 'turnsPhase'
	| 'drawPhase'
	| 'encounterPhase'
	| 'chapterEndPhase';

export interface ChapterState extends ProcedureState {}

const { define } = instructions<ChapterState>();

export const chapter = define({
	id: ProcedureId.Chapter,
	steps: {
		chapterStartPhase,
		focusPhase,
		turnsPhase,
		drawPhase,
		encounterPhase,
		chapterEndPhase
	}
});
