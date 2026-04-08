import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { MutableCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { MutablePlayerState } from '../game/playerstate';
import { DrawCardsEffect, drawCards } from './drawcards';

// ─── DrawCardsEffect construction ─────────────────────────────────────────────

describe('DrawCardsEffect construction', () => {
	it('drawCards(n) creates a DrawCardsEffect with the given amount', () => {
		const effect = drawCards(3);
		expect(effect).toBeInstanceOf(DrawCardsEffect);
		expect(effect.amount).toBe(3);
	});

	it('drawCards({ amount }) creates a DrawCardsEffect with the given amount', () => {
		const effect = drawCards({ amount: 5 });
		expect(effect).toBeInstanceOf(DrawCardsEffect);
		expect(effect.amount).toBe(5);
	});
});

// ─── DrawCardsEffect.trigger ──────────────────────────────────────────────────

describe('DrawCardsEffect.trigger', () => {
	it('draws the given number of cards from the active player and returns their ids', async () => {
		const c1 = mock<MutableCardState>({ id: 'c1' });
		const c2 = mock<MutableCardState>({ id: 'c2' });
		const mutableState = mock<MutableGameState>();
		const player = mock<MutablePlayerState>();
		player.drawFromDeck.calledWith(mutableState, 2).mockReturnValue([c1, c2]);
		mutableState.requireActivePlayer.mockReturnValue(player);
		const graph = mock<GameGraph>();
		let callbackReturn: unknown;
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callbackReturn = callback(mutableState);
		});

		await drawCards(2).trigger(graph);

		expect(callbackReturn).toEqual({ cards: ['c1', 'c2'] });
	});
});
