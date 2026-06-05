import type { GameGraph } from '../gamegraph';
import { TurnPhaseNode } from '../gamenodes';

export const runTurnEndPhase = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.group(TurnPhaseNode, { phase: 'turn-end' }, {}, async () => {
		await gameGraph.triggerEvent('turnEnd');
	});
};
