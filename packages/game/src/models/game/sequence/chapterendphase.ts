import type { GameGraph } from '../gamegraph';
import { ChapterPhaseNode } from '../gamenodes';

export const runChapterEndPhase = async (gameGraph: GameGraph) => {
	await gameGraph.group(ChapterPhaseNode, { phase: 'chapter-end' }, {}, async () => {
		await gameGraph.triggerEvent('chapterEnd');
		await readyAllCards(gameGraph);
	});
};

const readyAllCards = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.mutate((state) => {
		for (const card of state.cards()) {
			card.exhausted = false;
		}
	});
};
