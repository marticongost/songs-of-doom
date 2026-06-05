import { drawFocus } from '../../effects/drawfocuseffect';
import type { GameGraph } from '../gamegraph';
import { ChapterPhaseNode, PlayerFocusNode } from '../gamenodes';
import { FocusesField } from '../playerinput';

/**
 * C1 — Focus phase.
 * Each player trims their focus hand to their concentration, then draws 5 focus tokens.
 */
export const runFocusPhase = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.group(ChapterPhaseNode, { phase: 'focus' }, {}, async () => {
		for (const player of gameGraph.current.state.players) {
			if (player.defeated) continue;
			await gameGraph.group(PlayerFocusNode, {}, { subjectId: player.id }, async () => {
				await trimToConcentration(gameGraph);
				await gameGraph.triggerEffect(drawFocus(5));
			});
		}
	});
};

/**
 * Trims a player's focus hand down to their concentration value.
 *
 * If the hand already holds at most `concentration` tokens this is a no-op.
 * Otherwise the player is prompted to select which tokens to keep; any
 * excess are moved to the discard pile.
 */
export async function trimToConcentration(gameGraph: GameGraph): Promise<void> {
	const player = gameGraph.current.state.requireActivePlayer();
	const hand = player.focusesHand;
	const concentration = gameGraph.current.state.getConcentration(player.id);
	if (hand.totalCount() <= concentration) return;

	const { selection } = await gameGraph.requestInput(
		[
			new FocusesField({
				name: 'selection',
				focuses: hand,
				maxTotalTokens: concentration,
				required: true
			})
		],
		{ playerId: player.id }
	);

	gameGraph.mutate((state) => {
		const mutablePlayer = state.requirePlayer(player.id);
		for (const [token, currentCount] of hand.entries()) {
			const keep = selection?.get(token) ?? 0;
			const discard = currentCount - keep;
			if (discard > 0) {
				mutablePlayer.focusesHand.remove(token, discard);
				mutablePlayer.focusesDiscardPile.add(token, discard);
			}
		}
	});
}
