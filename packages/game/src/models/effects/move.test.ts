import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { immobilized } from '../../data/properties';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState, ReadonlyGameState } from '../game/gamestate';
import type { LocationId } from '../game/identifiers';
import type { ReadonlyLocationState } from '../game/locationstate';
import type { ReadonlyPlayerState } from '../game/playerstate';
import { MoveEffect, move } from './move';

function makeGraph() {
	const state = mock<ReadonlyGameState>();
	const graph = mock<GameGraph>();
	Object.defineProperty(graph, 'current', { get: () => ({ state }), configurable: true });
	return { graph, state };
}

// ─── MoveEffect construction ──────────────────────────────────────────────────

describe('MoveEffect construction', () => {
	it('move() creates a MoveEffect', () => {
		expect(move()).toBeInstanceOf(MoveEffect);
	});
});

// ─── MoveEffect.apply — early returns ────────────────────────────────────────

describe('MoveEffect.apply — early returns', () => {
	it('returns early when the subject is not a player', async () => {
		const { graph, state } = makeGraph();
		state.requireSubject.mockReturnValue({ id: 'crt1' } as never);

		await move().apply(graph);

		expect(graph.requestSingleTarget).not.toHaveBeenCalled();
	});

	it('returns early when the player has the immobilized property', async () => {
		const player = mock<ReadonlyPlayerState>();
		player.hasProperty.calledWith(immobilized).mockReturnValue(true);
		const { graph, state } = makeGraph();
		state.requireSubject.mockReturnValue({ id: 'plr1' } as never);
		state.requirePlayer.calledWith('plr1').mockReturnValue(player);

		await move().apply(graph);

		expect(graph.requestSingleTarget).not.toHaveBeenCalled();
	});

	it('returns early when the player is not in any location', async () => {
		const player = mock<ReadonlyPlayerState>();
		player.hasProperty.mockReturnValue(false);
		const { graph, state } = makeGraph();
		state.requireSubject.mockReturnValue({ id: 'plr1' } as never);
		state.requirePlayer.calledWith('plr1').mockReturnValue(player);
		state.getEntityLocation.calledWith('plr1').mockReturnValue(undefined);

		await move().apply(graph);

		expect(graph.requestSingleTarget).not.toHaveBeenCalled();
	});

	it('returns early when the current location has no connections', async () => {
		const player = mock<ReadonlyPlayerState>();
		player.hasProperty.mockReturnValue(false);
		const location = mock<ReadonlyLocationState>({ id: 'loc1' as LocationId, connections: [] });
		const { graph, state } = makeGraph();
		state.requireSubject.mockReturnValue({ id: 'plr1' } as never);
		state.requirePlayer.calledWith('plr1').mockReturnValue(player);
		state.getEntityLocation.calledWith('plr1').mockReturnValue(location);

		await move().apply(graph);

		expect(graph.requestSingleTarget).not.toHaveBeenCalled();
	});

	it('returns early when no destination is chosen', async () => {
		const player = mock<ReadonlyPlayerState>();
		player.hasProperty.mockReturnValue(false);
		const location = mock<ReadonlyLocationState>({
			id: 'loc1' as LocationId,
			connections: ['loc2' as LocationId]
		});
		const { graph, state } = makeGraph();
		state.requireSubject.mockReturnValue({ id: 'plr1' } as never);
		state.requirePlayer.calledWith('plr1').mockReturnValue(player);
		state.getEntityLocation.calledWith('plr1').mockReturnValue(location);
		graph.requestSingleTarget.mockResolvedValue(undefined);

		await move().apply(graph);

		expect(graph.triggerEvent).not.toHaveBeenCalled();
	});
});

// ─── MoveEffect.apply — happy path ───────────────────────────────────────────

describe('MoveEffect.apply', () => {
	it('triggers events and moves the player to the chosen destination', async () => {
		const player = mock<ReadonlyPlayerState>();
		player.hasProperty.mockReturnValue(false);
		const location = mock<ReadonlyLocationState>({
			id: 'loc1' as LocationId,
			connections: ['loc2' as LocationId]
		});
		const mutableState = mock<MutableGameState>();
		const { graph, state } = makeGraph();
		state.requireSubject.mockReturnValue({ id: 'plr1' } as never);
		state.requirePlayer.calledWith('plr1').mockReturnValue(player);
		state.getEntityLocation.calledWith('plr1').mockReturnValue(location);
		graph.requestSingleTarget.mockResolvedValue('loc2' as LocationId);
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await move().apply(graph);

		expect(graph.triggerEvent).toHaveBeenCalledWith('leavingLocation', { targetId: 'loc1' });
		expect(graph.triggerEvent).toHaveBeenCalledWith('movement', { targetId: 'loc2' });
		expect(graph.triggerEvent).toHaveBeenCalledWith('locationEntered', { targetId: 'loc2' });
		expect(mutableState.setPlayerLocation).toHaveBeenCalledWith('plr1', 'loc2');
	});
});
