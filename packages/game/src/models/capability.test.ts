import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { Action } from './capabilities/action';
import type { Effect } from './effects/effect';
import type { MutableCardState } from './game/cardstate';
import type { GameGraph } from './game/gamegraph';
import type { MutableGameState } from './game/gamestate';

// ─── Capability.trigger ───────────────────────────────────────────────────────

describe('Capability.trigger', () => {
	it('pushes cardId onto activeCardStack and implicitTargetStack', async () => {
		const mutableState = mock<MutableGameState>({
			activeCardStack: [],
			implicitTargetStack: []
		});
		const graph = mock<GameGraph>();
		let triggeredCallback!: (state: MutableGameState) => void;
		graph.capabilityTriggered.mockImplementation((_cap, _id, callback) => {
			if (typeof callback === 'function') triggeredCallback = callback;
		});
		graph.group.mockResolvedValue(undefined);

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'c1' });
		triggeredCallback(mutableState);

		expect(mutableState.activeCardStack).toContain('c1');
		expect(mutableState.implicitTargetStack).toContain('c1');
	});

	it('triggers all effects', async () => {
		const effect = mock<Effect>();
		const graph = mock<GameGraph>();
		graph.group.mockImplementation(async (callback) => {
			await callback();
		});
		graph.capabilityFinished.mockImplementation(() => {});

		await new Action({ effects: [effect] }).trigger({ gameGraph: graph, cardId: 'c1' });

		expect(effect.trigger).toHaveBeenCalledWith(graph);
	});

	it('pops both stacks and discards the active card on finish if it was in hand', async () => {
		const mutableState = mock<MutableGameState>({
			activeCardStack: ['c1'],
			implicitTargetStack: ['c1']
		});
		const card = mock<MutableCardState>({ container: { type: 'hand', playerId: 'p1' } });
		mutableState.requireActiveCard.mockReturnValue(card);
		const graph = mock<GameGraph>();
		graph.group.mockImplementation(async (callback) => {
			await callback();
		});
		let finishedCallback!: (state: MutableGameState) => void;
		graph.capabilityFinished.mockImplementation((_cap, _id, callback) => {
			if (typeof callback === 'function') finishedCallback = callback;
		});

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'c1' });
		finishedCallback(mutableState);

		expect(card.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
		expect(mutableState.activeCardStack).toEqual([]);
		expect(mutableState.implicitTargetStack).toEqual([]);
	});

	it('pops both stacks without discarding on finish if the card is not in hand', async () => {
		const mutableState = mock<MutableGameState>({
			activeCardStack: ['c1'],
			implicitTargetStack: ['c1']
		});
		const card = mock<MutableCardState>({ container: { type: 'deck', playerId: 'p1' } });
		mutableState.requireActiveCard.mockReturnValue(card);
		const graph = mock<GameGraph>();
		graph.group.mockImplementation(async (callback) => {
			await callback();
		});
		let finishedCallback!: (state: MutableGameState) => void;
		graph.capabilityFinished.mockImplementation((_cap, _id, callback) => {
			if (typeof callback === 'function') finishedCallback = callback;
		});

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'c1' });
		finishedCallback(mutableState);

		expect(card.moveToTopOfDiscardPile).not.toHaveBeenCalled();
		expect(mutableState.activeCardStack).toEqual([]);
		expect(mutableState.implicitTargetStack).toEqual([]);
	});
});
