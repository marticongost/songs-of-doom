import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { FocusToken } from '../..';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { MutablePlayerState } from '../game/playerstate';
import { Target } from '../target';
import { DrawFocusEffect, type DrawFocusOutcome, drawFocus } from './drawfocuseffect';

// --- DrawFocusEffect construction ------------------------------------------------

describe('DrawFocusEffect construction', () => {
	it('drawFocus(n) creates a DrawFocusEffect with the given amount', () => {
		const effect = drawFocus(3);
		expect(effect).toBeInstanceOf(DrawFocusEffect);
		expect(effect.amount).toBe(3);
		expect(effect.players).toBeUndefined();
	});

	it('drawFocus({ amount, players }) creates a DrawFocusEffect with the given props', () => {
		const players = new Target({ type: 'player' });
		const effect = drawFocus({ amount: 2, players });
		expect(effect).toBeInstanceOf(DrawFocusEffect);
		expect(effect.amount).toBe(2);
		expect(effect.players).toBe(players);
	});
});

// --- DrawFocusEffect.trigger -----------------------------------------------------

describe('DrawFocusEffect.trigger', () => {
	it.each([
		{ label: 'without players target', players: undefined },
		{ label: 'with players target', players: new Target({ type: 'player' }) }
	])(
		'draws the configured amount of focus tokens for each affected player $label',
		async ({ players }) => {
			const effect = drawFocus({ amount: 2, players });
			const player = mock<MutablePlayerState>();
			const mutableState = mock<MutableGameState>();
			mutableState.requirePlayer.calledWith('p1').mockReturnValue(player);
			player.drawFocusToken.calledWith(mutableState).mockReturnValue('strength-1');
			const graph = mock<GameGraph>();
			graph.requestPlayers
				.calledWith(effect.players, expect.objectContaining({ default: expect.any(Function) }))
				.mockResolvedValue(['p1']);
			let callbackReturn: unknown;
			graph.effectTriggered.mockImplementation((_effect, callback) => {
				callbackReturn = callback(mutableState);
			});

			await effect.trigger(graph);

			const outcome = callbackReturn as DrawFocusOutcome;
			expect(outcome.playerDrawnTokens.get('p1')?.totalCount()).toBe(2);
			expect(outcome.playerDrawnTokens.get('p1')?.get('strength-1')).toBe(2);
		}
	);

	it('tracks drawn focus tokens independently for each player', async () => {
		const p1 = mock<MutablePlayerState>();
		const p2 = mock<MutablePlayerState>();
		const mutableState = mock<MutableGameState>();
		mutableState.requirePlayer.calledWith('p1').mockReturnValue(p1);
		mutableState.requirePlayer.calledWith('p2').mockReturnValue(p2);
		p1.drawFocusToken
			.calledWith(mutableState)
			.mockReturnValueOnce('strength-1' as FocusToken)
			.mockReturnValueOnce('will-2' as FocusToken);
		p2.drawFocusToken
			.calledWith(mutableState)
			.mockReturnValueOnce('will-2' as FocusToken)
			.mockReturnValueOnce('will-2' as FocusToken);
		const graph = mock<GameGraph>();
		graph.requestPlayers.mockResolvedValue(['p1', 'p2']);
		let callbackReturn: unknown;
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callbackReturn = callback(mutableState);
		});

		await drawFocus(2).trigger(graph);

		const outcome = callbackReturn as DrawFocusOutcome;
		expect(outcome.playerDrawnTokens.get('p1')?.get('strength-1')).toBe(1);
		expect(outcome.playerDrawnTokens.get('p1')?.get('will-2')).toBe(1);
		expect(outcome.playerDrawnTokens.get('p2')?.get('will-2')).toBe(2);
	});
});
