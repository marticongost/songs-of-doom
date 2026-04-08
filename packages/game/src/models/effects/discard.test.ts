import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { MutableCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { DiscardEffect, discard } from './discard';

// ─── DiscardEffect construction ───────────────────────────────────────────────

describe('DiscardEffect construction', () => {
	it('discard() creates a DiscardEffect', () => {
		expect(discard()).toBeInstanceOf(DiscardEffect);
	});
});

// ─── DiscardEffect.trigger ────────────────────────────────────────────────────

describe('DiscardEffect.trigger', () => {
	it('moves the active card to the top of the discard pile', async () => {
		const activeCard = mock<MutableCardState>();
		const mutableState = mock<MutableGameState>({
			requireActiveCard: () => activeCard
		});
		const graph = mock<GameGraph>();
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await discard().trigger(graph);

		expect(activeCard.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
	});
});
