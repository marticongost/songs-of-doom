import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { MutableCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { MutablePlayerState } from '../game/playerstate';
import { Target } from '../target';
import { DiscardFromHandEffect, discardFromHand } from './discardfromhand';

// ─── DiscardFromHandEffect construction ──────────────────────────────────────

describe('DiscardFromHandEffect construction', () => {
	it('discardFromHand() creates a DiscardFromHandEffect with default cards target', () => {
		const effect = discardFromHand();
		expect(effect).toBeInstanceOf(DiscardFromHandEffect);
		expect(effect.players).toBeUndefined();
		expect(effect.cards).toBeInstanceOf(Target);
		expect(effect.cards.cardinality.min).toBe(1);
		expect(effect.cards.cardinality.max).toBe(1);
	});
});

// ─── DiscardFromHandEffect.apply ───────────────────────────────────────────

describe('DiscardFromHandEffect.apply', () => {
	it.each([
		{ label: 'without players target', players: undefined },
		{ label: 'with players target', players: new Target({ type: 'player' }) }
	])('discards the selected cards from each affected player $label', async ({ players }) => {
		const cards = new Target({ type: 'skill', cardinality: '1+' });
		const effect = discardFromHand({ cards, players });
		const card = mock<MutableCardState>();
		const player = mock<MutablePlayerState>();
		player.requireCard.calledWith('trt1').mockReturnValue(card);
		const mutableState = mock<MutableGameState>();
		mutableState.requirePlayer.calledWith('plr1').mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestPlayers
			.calledWith(effect.players, expect.objectContaining({ default: 'active-player' }))
			.mockResolvedValue(['plr1']);
		const cardsRequestArg = effect.cards as unknown as ReadonlyArray<never>;
		graph.requestInput.calledWith(cardsRequestArg).mockResolvedValue({ target: ['trt1'] });
		let callbackReturn: unknown;
		graph.mutate.mockImplementation((fn) => {
			callbackReturn = fn(mutableState);
			return callbackReturn;
		});

		await effect.apply(graph);

		expect(card.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(callbackReturn).toEqual({ playerDiscards: new Map([['plr1', ['trt1']]]) });
	});

	it('requests cards for each player and discards all selected cards', async () => {
		const effect = discardFromHand({ cards: { type: 'skill', cardinality: '1+' } });
		const p1c1 = mock<MutableCardState>();
		const p1c2 = mock<MutableCardState>();
		const p2c1 = mock<MutableCardState>();
		const p1 = mock<MutablePlayerState>();
		const p2 = mock<MutablePlayerState>();
		p1.requireCard.calledWith('trt1').mockReturnValue(p1c1);
		p1.requireCard.calledWith('trt2').mockReturnValue(p1c2);
		p2.requireCard.calledWith('trt3').mockReturnValue(p2c1);
		const mutableState = mock<MutableGameState>();
		mutableState.requirePlayer.calledWith('plr1').mockReturnValue(p1);
		mutableState.requirePlayer.calledWith('plr2').mockReturnValue(p2);
		const graph = mock<GameGraph>();
		graph.requestPlayers
			.calledWith(effect.players, expect.objectContaining({ default: 'active-player' }))
			.mockResolvedValue(['plr1', 'plr2']);
		const cardsRequestArg = effect.cards as unknown as ReadonlyArray<never>;
		const requestInput = graph.requestInput.calledWith(cardsRequestArg);
		requestInput.mockResolvedValueOnce({ target: ['trt1', 'trt2'] });
		requestInput.mockResolvedValueOnce({ target: ['trt3'] });
		let callbackReturn: unknown;
		graph.mutate.mockImplementation((fn) => {
			callbackReturn = fn(mutableState);
			return callbackReturn;
		});

		await effect.apply(graph);

		expect(p1c1.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(p1c2.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(p2c1.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(callbackReturn).toEqual({
			playerDiscards: new Map([
				['plr1', ['trt1', 'trt2']],
				['plr2', ['trt3']]
			])
		});
	});
});
