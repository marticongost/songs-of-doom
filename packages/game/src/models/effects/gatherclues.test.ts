import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { Entity } from '../entities';
import { ReadonlyCardState, type MutableCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { ReadonlyLocationState, type MutableLocationState } from '../game/locationstate';
import { Target } from '../target';
import { GatherCluesEffect, gatherClues, type GatherCluesOutcome } from './gatherclues';

function makeSubject(id: `c${number}`, clues = 0): MutableCardState {
	return new ReadonlyCardState({
		id,
		card: mock<Entity>(),
		ownerId: 'p1',
		container: { type: 'hand', playerId: 'p1' },
		clues,
		properties: []
	}).mutable();
}

function makeLocation(id: `c${number}`, clues: number): MutableLocationState {
	return new ReadonlyLocationState({
		id,
		card: mock<Entity>(),
		ownerId: 'p1',
		container: { type: 'hand', playerId: 'p1' },
		clues,
		properties: []
	}).mutable();
}

// ─── GatherCluesEffect construction ───────────────────────────────────────────

describe('GatherCluesEffect construction', () => {
	it('gatherClues(amount) creates an effect with that amount', () => {
		const effect = gatherClues(3);
		expect(effect).toBeInstanceOf(GatherCluesEffect);
		expect(effect.amount).toBe(3);
	});

	it('gatherClues({ amount }) creates an effect whose target defaults to a Target instance', () => {
		const effect = gatherClues({ amount: 2 });
		expect(effect.amount).toBe(2);
		expect(effect.target).toBeInstanceOf(Target);
	});

	it('gatherClues({ amount, target }) stores target as a Target instance', () => {
		const target = new Target({ type: 'location' });
		const effect = gatherClues({ amount: 1, target });
		expect(effect.target).toBeInstanceOf(Target);
	});
});

// ─── GatherCluesEffect.trigger ────────────────────────────────────────────────

describe('GatherCluesEffect.trigger', () => {
	it('transfers clues from the location to the subject and returns the outcome', async () => {
		const subject = makeSubject('c1', 0);
		const location = makeLocation('c2', 5);
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(subject);
		mutableState.requireCard
			.calledWith('c2')
			.mockReturnValue(location as unknown as MutableCardState);
		mutableState.evaluate.calledWith(3).mockReturnValue(3);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(subject);
		graph.requestTargets.mockResolvedValue(['c2']);
		let callbackReturn: unknown;
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callbackReturn = callback(mutableState);
		});

		await gatherClues(3).trigger(graph);

		expect(subject.clues).toBe(3);
		expect(location.clues).toBe(2);
		const outcome = callbackReturn as GatherCluesOutcome;
		expect(outcome.gatheredClues.get('c2')).toBe(3);
	});

	it('gathers at most the available clues on the location', async () => {
		const subject = makeSubject('c1', 0);
		const location = makeLocation('c2', 2);
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(subject);
		mutableState.requireCard
			.calledWith('c2')
			.mockReturnValue(location as unknown as MutableCardState);
		mutableState.evaluate.calledWith(5).mockReturnValue(5);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(subject);
		graph.requestTargets.mockResolvedValue(['c2']);
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await gatherClues(5).trigger(graph);

		expect(subject.clues).toBe(2);
		expect(location.clues).toBe(0);
	});

	it('gathers from each location when multiple targets are provided', async () => {
		const subject = makeSubject('c1', 0);
		const loc1 = makeLocation('c2', 3);
		const loc2 = makeLocation('c3', 4);
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(subject);
		mutableState.requireCard.calledWith('c2').mockReturnValue(loc1 as unknown as MutableCardState);
		mutableState.requireCard.calledWith('c3').mockReturnValue(loc2 as unknown as MutableCardState);
		mutableState.evaluate.calledWith(2).mockReturnValue(2);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(subject);
		graph.requestTargets.mockResolvedValue(['c2', 'c3']);
		let callbackReturn: unknown;
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callbackReturn = callback(mutableState);
		});

		await gatherClues(2).trigger(graph);

		expect(subject.clues).toBe(4);
		expect(loc1.clues).toBe(1);
		expect(loc2.clues).toBe(2);
		const outcome = callbackReturn as GatherCluesOutcome;
		expect(outcome.gatheredClues.get('c2')).toBe(2);
		expect(outcome.gatheredClues.get('c3')).toBe(2);
	});
});
