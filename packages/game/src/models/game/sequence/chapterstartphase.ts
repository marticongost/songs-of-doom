import type { GameGraph } from '../gamegraph';
import { ChapterPhaseNode } from '../gamenodes';

export const runChapterStartPhase = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.group(ChapterPhaseNode, { phase: 'chapter-start' }, {}, async () => {
		await gameGraph.triggerEvent('chapterStart');
	});
};
