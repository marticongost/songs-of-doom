import type { GameGraph } from '../gamegraph';
import { ChapterNode } from '../gamenodes';
import { runChapterEndPhase } from './chapterendphase';
import { runChapterStartPhase } from './chapterstartphase';
import { runDrawPhase } from './drawphase';
import { runEncounterPhase } from './encounterphase';
import { runFocusPhase } from './focusphase';
import { runTurnsPhase } from './turnsphase';

/**
 * Runs a full game chapter (phases C0–C5).
 * Entry point: call `gameGraph.runChapter()` which delegates here.
 */
export async function runChapter(gameGraph: GameGraph): Promise<void> {
	await gameGraph.group(
		ChapterNode,
		{ chapter: gameGraph.current.state.chapter + 1 },
		{},
		async () => {
			await runChapterStartPhase(gameGraph);
			await runFocusPhase(gameGraph);
			await runTurnsPhase(gameGraph);
			await runDrawPhase(gameGraph);
			await runEncounterPhase(gameGraph);
			await runChapterEndPhase(gameGraph);
		}
	);
}
