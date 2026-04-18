import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { CharacterState } from '../characters';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { MutablePlayerState, ReadonlyPlayerState } from '../game/playerstate';
import { Target } from '../target';
import { RecoverSanityEffect, recoverSanity } from './recoversanity';

function makePlayer(id: 'plr1' | 'plr2', mentalTrauma: number): MutablePlayerState {
	return new ReadonlyPlayerState({
		id,
		character: mock<CharacterState>(),
		deck: [],
		hand: [],
		discardPile: [],
		attachments: [],
		focusesBag: new Counter(),
		focusesDiscardPile: new Counter(),
		focusesHand: new Counter(),
		physicalTrauma: 0,
		mentalTrauma
	}).mutable();
}

// ─── RecoverSanityEffect construction ────────────────────────────────────────

describe('RecoverSanityEffect construction', () => {
	it('recoverSanity(2) creates a RecoverSanityEffect with amount 2', () => {
		const effect = recoverSanity(2);
		expect(effect).toBeInstanceOf(RecoverSanityEffect);
		expect(effect.amount).toBe(2);
	});

	it('recoverSanity({ amount }) creates a RecoverSanityEffect with no target', () => {
		const effect = recoverSanity({ amount: 3 });
		expect(effect).toBeInstanceOf(RecoverSanityEffect);
		expect(effect.target).toBeUndefined();
	});

	it('recoverSanity({ amount, target }) creates a RecoverSanityEffect with a target', () => {
		const effect = recoverSanity({ amount: 2, target: { type: 'player' } });
		expect(effect.target).toBeInstanceOf(Target);
	});
});

// ─── RecoverSanityEffect.apply — no explicit target ───────────────────────────

describe('RecoverSanityEffect.apply — no explicit target', () => {
	it('reduces mentalTrauma of the subject by the recovery amount', async () => {
		const subject = makePlayer('plr1', 5);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(3);
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(subject);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr1');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await recoverSanity(3).apply(graph);

		expect(subject.mentalTrauma).toBe(2);
	});

	it('caps recovery at current mentalTrauma (does not go below 0)', async () => {
		const subject = makePlayer('plr1', 2);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(5);
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(subject);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr1');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await recoverSanity(5).apply(graph);

		expect(subject.mentalTrauma).toBe(0);
	});
});

// ─── RecoverSanityEffect.apply — with explicit target ─────────────────────────

describe('RecoverSanityEffect.apply — with explicit target', () => {
	it('requests the chosen target and reduces their mentalTrauma', async () => {
		const target = makePlayer('plr2', 4);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(2);
		mutableState.requireEntityState.calledWith('plr2').mockReturnValue(target);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr2');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await recoverSanity({ amount: 2, target: { type: 'player' } }).apply(graph);

		expect(target.mentalTrauma).toBe(2);
	});

	it('caps recovery at current mentalTrauma when targeting explicitly', async () => {
		const target = makePlayer('plr2', 1);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(10);
		mutableState.requireEntityState.calledWith('plr2').mockReturnValue(target);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr2');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await recoverSanity({ amount: 10, target: { type: 'player' } }).apply(graph);

		expect(target.mentalTrauma).toBe(0);
	});
});
