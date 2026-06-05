import type { GameGraph } from '../gamegraph';
import { ChapterPhaseNode } from '../gamenodes';
import { runCreatureActionsPhase } from './turncreatureactionsphase';
import { runTurnEndPhase } from './turnendphase';
import { runPlayerActionsPhase } from './turnplayeractionsphase';
import { runTurnStartPhase } from './turnstartphase';

/**
 * C2 — Turns phase.
 * Runs turns in a loop until no entity acts.
 */
export const runTurnsPhase = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.group(ChapterPhaseNode, { phase: 'turns' }, {}, async () => {
		let acted: boolean;
		do {
			acted = await runTurn(gameGraph);
		} while (acted);
	});
};

/**
 * Runs a single turn (T0–T3).
 * Returns true if at least one entity performed a non-pass action.
 */
export async function runTurn(gameGraph: GameGraph): Promise<boolean> {
	await runTurnStartPhase(gameGraph);

	// T1 — Player and ally actions (choose & execute immediately)
	const playersPerformedActions = await runPlayerActionsPhase(gameGraph);

	// T2 — Creature actions (players select creature, action auto-chosen & executed)
	const creaturesPerformedActions = await runCreatureActionsPhase(gameGraph);

	// T3 — Turn end
	await runTurnEndPhase(gameGraph);

	return playersPerformedActions || creaturesPerformedActions;
}
