import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { FocusToken } from '../..';
import type { GameGraph } from '../game/gamegraph';
import type { GameNode } from '../game/gamenodes';
import { MutableGameState, type ReadonlyGameState } from '../game/gamestate';
import type { MutablePlayerState, ReadonlyPlayerState } from '../game/playerstate';
import { RedrawFocusEffect, type RedrawFocusOutcome, redrawFocus } from './redrawfocus';

// --- RedrawFocusEffect construction ------------------------------------------------

describe('RedrawFocusEffect construction', () => {
	it('redrawFocus(n) creates a RedrawFocusEffect with the given amount', () => {
		const effect = redrawFocus(3);
		expect(effect).toBeInstanceOf(RedrawFocusEffect);
		expect(effect.amount).toBe(3);
	});

	it('redrawFocus({ amount }) creates a RedrawFocusEffect with the given props', () => {
		const effect = redrawFocus({ amount: 2 });
		expect(effect).toBeInstanceOf(RedrawFocusEffect);
		expect(effect.amount).toBe(2);
	});
});

// --- RedrawFocusEffect.apply -----------------------------------------------------

describe('RedrawFocusEffect.apply', () => {
	function setup({
		handTokens = [],
		amount = 0,
		returnSelection
	}: {
		handTokens?: Array<[FocusToken, number]>;
		amount?: number;
		returnSelection?: Counter<FocusToken>;
	}) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const currentState = mock<ReadonlyGameState>({ evaluate: (() => amount) as any });

		const hand = new Counter<FocusToken>();
		for (const [token, count] of handTokens) {
			hand.add(token, count);
		}
		const player = mock<ReadonlyPlayerState>({ focusesHand: hand });
		currentState.requirePlayer.mockReturnValue(player);

		const current = mock<GameNode>({ state: currentState });

		const graph = mock<GameGraph>({ current });

		const mutablePlayer = mock<MutablePlayerState>();
		mutablePlayer.discardFocusToken.mockImplementation((token: FocusToken, count: number = 1) => {
			player.focusesHand.remove(token as FocusToken, count);
		});
		mutablePlayer.drawFocusToken.mockReturnValue('strength-1' as FocusToken);

		const mutableState = mock<MutablePlayerState['focusesHand']>();
		graph.requestPlayers
			.calledWith(undefined, expect.objectContaining({ default: 'active-player' }))
			.mockResolvedValue(['plr1']);

		const selection = returnSelection ?? new Counter<FocusToken>();
		graph.requestInput.mockResolvedValue({ selection });

		let callbackReturn: unknown;
		graph.mutate.mockImplementation((fn) => {
			const mutable = mock<MutableGameState>({ requirePlayer: () => mutablePlayer });
			callbackReturn = fn(mutable);
			return callbackReturn;
		});

		return { graph, mutablePlayer, mutableState, callbackReturn: () => callbackReturn };
	}

	it('redraws the configured amount of focus tokens', async () => {
		const selection = new Counter<FocusToken>();
		selection.add('strength-1', 1);
		selection.add('agility-2', 1);

		const { graph, mutablePlayer, callbackReturn } = setup({
			handTokens: [
				['strength-1', 1],
				['agility-2', 1],
				['will-3', 1]
			],
			amount: 2,
			returnSelection: selection
		});

		await redrawFocus(2).apply(graph);

		const outcome = callbackReturn() as RedrawFocusOutcome;

		expect(mutablePlayer.discardFocusToken).toHaveBeenCalledWith('strength-1', 1);
		expect(mutablePlayer.discardFocusToken).toHaveBeenCalledWith('agility-2', 1);
		expect(mutablePlayer.drawFocusToken).toHaveBeenCalledTimes(2);
		expect(outcome.discardedTokens.get('strength-1')).toBe(1);
		expect(outcome.discardedTokens.get('agility-2')).toBe(1);
		expect(outcome.drawnTokens.totalCount()).toBe(2);
	});

	it('does nothing when amount is zero', async () => {
		const graph = setup({ amount: 0 }).graph;

		await redrawFocus(0).apply(graph);

		expect(graph.requestInput).not.toHaveBeenCalled();
		expect(graph.mutate).not.toHaveBeenCalled();
	});

	it('does nothing when amount is negative', async () => {
		const graph = setup({ amount: -1 }).graph;

		await redrawFocus(-1).apply(graph);

		expect(graph.requestInput).not.toHaveBeenCalled();
		expect(graph.mutate).not.toHaveBeenCalled();
	});

	it('does nothing when hand is empty', async () => {
		const graph = setup({ amount: 3 }).graph;

		await redrawFocus(3).apply(graph);

		expect(graph.requestInput).not.toHaveBeenCalled();
		expect(graph.mutate).not.toHaveBeenCalled();
	});

	it('caps the amount to the number of tokens in hand', async () => {
		const selection = new Counter<FocusToken>();
		selection.add('strength-1', 2);

		const { graph, mutablePlayer, callbackReturn } = setup({
			handTokens: [['strength-1', 2]],
			amount: 5,
			returnSelection: selection
		});

		await redrawFocus(5).apply(graph);

		const outcome = callbackReturn() as RedrawFocusOutcome;

		expect(mutablePlayer.discardFocusToken).toHaveBeenCalledWith('strength-1', 2);
		expect(mutablePlayer.drawFocusToken).toHaveBeenCalledTimes(2);
		expect(outcome.discardedTokens.get('strength-1')).toBe(2);
		expect(outcome.drawnTokens.totalCount()).toBe(2);
	});

	it('discards partial amounts from hand', async () => {
		const selection = new Counter<FocusToken>();
		selection.add('strength-1', 1);

		const { graph, mutablePlayer, callbackReturn } = setup({
			handTokens: [['strength-1', 3]],
			amount: 1,
			returnSelection: selection
		});

		await redrawFocus(1).apply(graph);

		const outcome = callbackReturn() as RedrawFocusOutcome;

		expect(mutablePlayer.discardFocusToken).toHaveBeenCalledWith('strength-1', 1);
		expect(mutablePlayer.drawFocusToken).toHaveBeenCalledTimes(1);
		expect(outcome.discardedTokens.get('strength-1')).toBe(1);
		expect(outcome.drawnTokens.totalCount()).toBe(1);
	});
});
