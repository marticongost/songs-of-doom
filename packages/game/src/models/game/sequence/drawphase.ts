import { drawCards } from '../../effects/drawcards';
import type { GameGraph } from '../gamegraph';
import { ChapterPhaseNode } from '../gamenodes';

/**
 * C4 — Draw phase.
 * Each non-defeated player draws 1 card.
 */
export const runDrawPhase = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.group(ChapterPhaseNode, { phase: 'draw' }, {}, async () => {
		for (const player of gameGraph.current.state.players) {
			if (player.defeated) continue;
			await gameGraph.triggerEffect(drawCards(1), { subjectId: player.id });
		}
	});
};
