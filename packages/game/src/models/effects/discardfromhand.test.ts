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

// ─── DiscardFromHandEffect.trigger ───────────────────────────────────────────

describe('DiscardFromHandEffect.trigger', () => {
	it.each([
		{ label: 'without players target', players: undefined },
		{ label: 'with players target', players: new Target({ type: 'player' }) }
	])('discards the selected cards from each affected player $label', async ({ players }) => {
		const cards = new Target({ type: 'skill', cardinality: '1+' });
		const effect = discardFromHand({ cards, players });
		const card = mock<MutableCardState>();
		const player = mock<MutablePlayerState>();
		player.requireCard.calledWith('c1').mockReturnValue(card);
		const mutableState = mock<MutableGameState>();
		mutableState.requirePlayer.calledWith('p1').mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestPlayersOrActivePlayer.calledWith(effect.players).mockResolvedValue(['p1']);
		graph.requestInput.calledWith(effect.cards).mockResolvedValue({ target: ['c1'] });
		let callbackReturn: unknown;
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callbackReturn = callback(mutableState);
		});

		await effect.trigger(graph);

		expect(card.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(callbackReturn).toEqual({ playerDiscards: new Map([['p1', ['c1']]]) });
	});

	it('requests cards for each player and discards all selected cards', async () => {
		const effect = discardFromHand({ cards: { type: 'skill', cardinality: '1+' } });
		const p1c1 = mock<MutableCardState>();
		const p1c2 = mock<MutableCardState>();
		const p2c1 = mock<MutableCardState>();
		const p1 = mock<MutablePlayerState>();
		const p2 = mock<MutablePlayerState>();
		p1.requireCard.calledWith('c1').mockReturnValue(p1c1);
		p1.requireCard.calledWith('c2').mockReturnValue(p1c2);
		p2.requireCard.calledWith('c3').mockReturnValue(p2c1);
		const mutableState = mock<MutableGameState>();
		mutableState.requirePlayer.calledWith('p1').mockReturnValue(p1);
		mutableState.requirePlayer.calledWith('p2').mockReturnValue(p2);
		const graph = mock<GameGraph>();
		graph.requestPlayersOrActivePlayer.calledWith(effect.players).mockResolvedValue(['p1', 'p2']);
		const requestInput = graph.requestInput.calledWith(effect.cards);
		requestInput.mockResolvedValueOnce({ target: ['c1', 'c2'] });
		requestInput.mockResolvedValueOnce({ target: ['c3'] });
		let callbackReturn: unknown;
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callbackReturn = callback(mutableState);
		});

		await effect.trigger(graph);

		expect(p1c1.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(p1c2.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(p2c1.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(callbackReturn).toEqual({
			playerDiscards: new Map([
				['p1', ['c1', 'c2']],
				['p2', ['c3']]
			])
		});
	});
});
