import { isAlly, isCreature } from '../../entities';
import type { GameGraph } from '../gamegraph';
import { TurnPhaseNode } from '../gamenodes';

export const runTurnStartPhase = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.group(TurnPhaseNode, { phase: 'turn-start' }, {}, async () => {
		await resetActivated(gameGraph);
		await gameGraph.triggerEvent('turnStart');
	});
};

const resetActivated = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.mutate((state) => {
		for (const player of state.players) {
			player.activated = false;
		}
		for (const card of state.cards()) {
			if (isAlly(card.card) || isCreature(card.card)) {
				card.activated = false;
			}
		}
	});
};
