import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { CharacterState } from '../characters';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { MutablePlayerState, ReadonlyPlayerState } from '../game/playerstate';
import { Target } from '../target';
import { HealEffect, heal } from './heal';

function makePlayer(id: 'plr1' | 'plr2', physicalTrauma: number): MutablePlayerState {
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
		physicalTrauma,
		mentalTrauma: 0
	}).mutable();
}

// ─── HealEffect construction ──────────────────────────────────────────────────

describe('HealEffect construction', () => {
	it('heal(2) creates a HealEffect with amount 2', () => {
		const effect = heal(2);
		expect(effect).toBeInstanceOf(HealEffect);
		expect(effect.amount).toBe(2);
	});

	it('heal({ amount }) creates a HealEffect with no target', () => {
		const effect = heal({ amount: 3 });
		expect(effect).toBeInstanceOf(HealEffect);
		expect(effect.target).toBeUndefined();
	});

	it('heal({ amount, target }) creates a HealEffect with a target', () => {
		const effect = heal({ amount: 2, target: { type: 'player' } });
		expect(effect.target).toBeInstanceOf(Target);
	});
});

// ─── HealEffect.apply — no explicit target ────────────────────────────────────

describe('HealEffect.apply — no explicit target', () => {
	it('reduces physicalTrauma of the subject by the heal amount', async () => {
		const subject = makePlayer('plr1', 5);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(3);
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(subject);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr1');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await heal(3).apply(graph);

		expect(subject.physicalTrauma).toBe(2);
	});

	it('caps healing at current physicalTrauma (does not go below 0)', async () => {
		const subject = makePlayer('plr1', 2);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(5);
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(subject);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr1');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await heal(5).apply(graph);

		expect(subject.physicalTrauma).toBe(0);
	});
});

// ─── HealEffect.apply — with explicit target ──────────────────────────────────

describe('HealEffect.apply — with explicit target', () => {
	it('requests the chosen target and reduces their physicalTrauma', async () => {
		const target = makePlayer('plr2', 4);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(2);
		mutableState.requireEntityState.calledWith('plr2').mockReturnValue(target);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr2');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await heal({ amount: 2, target: { type: 'player' } }).apply(graph);

		expect(target.physicalTrauma).toBe(2);
	});

	it('caps healing at current physicalTrauma when targeting explicitly', async () => {
		const target = makePlayer('plr2', 1);
		const mutableState = mock<MutableGameState>();
		mutableState.evaluate.mockReturnValue(10);
		mutableState.requireEntityState.calledWith('plr2').mockReturnValue(target);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('plr2');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await heal({ amount: 10, target: { type: 'player' } }).apply(graph);

		expect(target.physicalTrauma).toBe(0);
	});
});
