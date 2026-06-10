import { mock } from '@songsofdoom/common/test-utils';
import type { Entity } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { MutableCardState, ReadonlyCardState } from './cardstate';
import type { EntityId, LocationId } from './identifiers';
import { MutableLocationState, ReadonlyLocationState, type LocationGraph } from './locationstate';

function makeLocation(overrides?: {
	id?: LocationId;
	clues?: number;
	players?: Array<EntityId>;
	connections?: Array<LocationId>;
	attachments?: ReadonlyArray<ReadonlyCardState>;
}): ReadonlyLocationState {
	return new ReadonlyLocationState({
		id: overrides?.id ?? 'loc1',
		card: mock<Entity>(),
		ownerId: 'plr1',
		container: { type: 'location', locationId: overrides?.id ?? 'loc1' },
		attachments: overrides?.attachments,
		clues: overrides?.clues,
		players: overrides?.players,
		connections: overrides?.connections,
		properties: []
	});
}

// ─── LocationState constructor ──────────────────────────────────────────────

describe('LocationState', () => {
	describe('constructor defaults', () => {
		it('defaults clues to 0, players and connections to empty arrays', () => {
			const location = makeLocation();

			expect(location.clues).toBe(0);
			expect(location.players).toEqual([]);
			expect(location.connections).toEqual([]);
		});
	});
});

// ─── ReadonlyLocationState ──────────────────────────────────────────────────

describe('ReadonlyLocationState', () => {
	describe('mutable', () => {
		it('creates a mutable copy preserving clues, players, connections, and attachments', () => {
			const attachment = new ReadonlyCardState({
				id: 'trt2',
				card: mock<Entity>(),
				ownerId: 'plr1',
				container: { type: 'location', locationId: 'loc1' },
				properties: []
			});
			const location = makeLocation({
				clues: 2,
				players: ['plr1'],
				connections: ['loc2'],
				attachments: [attachment]
			});
			const mutable = location.mutable();

			expect(mutable).toBeInstanceOf(MutableLocationState);
			expect(mutable.clues).toBe(2);
			expect(mutable.players).toEqual(['plr1']);
			expect(mutable.connections).toEqual(['loc2']);
			expect(mutable.attachments[0]).toBeInstanceOf(MutableCardState);
		});
	});

	describe('mutate', () => {
		it('applies the change without mutating the original', () => {
			const location = makeLocation({ clues: 1, connections: ['loc2'] });
			const updated = location.mutate((mutable) => {
				mutable.clues = 3;
				mutable.players.push('plr2');
				mutable.connections.push('loc3');
			});

			expect(updated.clues).toBe(3);
			expect(updated.players).toEqual(['plr2']);
			expect(updated.connections).toEqual(['loc2', 'loc3']);
			expect(location.clues).toBe(1);
			expect(location.players).toEqual([]);
			expect(location.connections).toEqual(['loc2']);
		});
	});
});

// ─── tracePath ──────────────────────────────────────────────────────────────

/**
 * Build a minimal LocationGraph from a map of id → connections.
 * Locations not explicitly listed have no connections.
 */
function makeGraph(topology: Record<LocationId, Array<LocationId>>): LocationGraph {
	const locations = new Map<LocationId, ReadonlyLocationState>();
	for (const [id, connections] of Object.entries(topology) as Array<
		[LocationId, Array<LocationId>]
	>) {
		locations.set(id, makeLocation({ id, connections }));
	}
	return { getCard: (id) => locations.get(id) };
}

describe('LocationState.tracePath', () => {
	it('returns [] when origin and target are the same location', () => {
		const loc = makeLocation({ id: 'loc1' });
		const graph = makeGraph({ loc1: [] });

		expect(loc.tracePath('loc1', graph)).toEqual([]);
	});

	it('returns direct connection path', () => {
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2'] });
		const graph = makeGraph({ loc1: ['loc2'], loc2: [] });

		expect(loc1.tracePath('loc2', graph)).toEqual(['loc2']);
	});

	it('returns shortest multi-hop path', () => {
		// loc1 → loc2 → loc3
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2'] });
		const graph = makeGraph({ loc1: ['loc2'], loc2: ['loc3'], loc3: [] });

		expect(loc1.tracePath('loc3', graph)).toEqual(['loc2', 'loc3']);
	});

	it('returns undefined when no path exists', () => {
		const loc1 = makeLocation({ id: 'loc1', connections: [] });
		const graph = makeGraph({ loc1: [], loc2: [] });

		expect(loc1.tracePath('loc2', graph)).toBeUndefined();
	});

	it('prefers the shorter path when multiple routes exist', () => {
		// loc1 has two routes to loc3: short (loc1→loc3) and long (loc1→loc2→loc3)
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2', 'loc3'] });
		const graph = makeGraph({ loc1: ['loc2', 'loc3'], loc2: ['loc3'], loc3: [] });

		expect(loc1.tracePath('loc3', graph)).toEqual(['loc3']);
	});

	it('respects allowedConnections to block traversal', () => {
		// loc1 → loc2 → loc3; the loc1→loc2 connection is blocked
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2'] });
		const graph = makeGraph({ loc1: ['loc2'], loc2: ['loc3'], loc3: [] });

		const result = loc1.tracePath('loc3', graph, {
			allowedConnections: (origin, dest) => !(origin === 'loc1' && dest === 'loc2')
		});

		expect(result).toBeUndefined();
	});

	it('uses scorer to break ties among equally short paths', () => {
		// loc1 → loc2 → loc4  (length 2)
		// loc1 → loc3 → loc4  (length 2)
		// scorer prefers paths through loc3
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2', 'loc3'] });
		const graph = makeGraph({
			loc1: ['loc2', 'loc3'],
			loc2: ['loc4'],
			loc3: ['loc4'],
			loc4: []
		});

		const result = loc1.tracePath('loc4', graph, {
			scorer: (path) => (path.includes('loc3') ? 1 : 0)
		});

		expect(result).toEqual(['loc3', 'loc4']);
	});

	it('accepts a LocationState instance as target', () => {
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2'] });
		const loc2 = makeLocation({ id: 'loc2' });
		const graph = makeGraph({ loc1: ['loc2'], loc2: [] });

		expect(loc1.tracePath(loc2, graph)).toEqual(['loc2']);
	});
});

// ─── distanceTo ─────────────────────────────────────────────────────────────

describe('LocationState.distanceTo', () => {
	it('returns 0 when at the target location', () => {
		const loc1 = makeLocation({ id: 'loc1' });
		const graph = makeGraph({ loc1: [] });

		expect(loc1.distanceTo('loc1', graph)).toBe(0);
	});

	it('returns 1 for a direct connection', () => {
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2'] });
		const graph = makeGraph({ loc1: ['loc2'], loc2: [] });

		expect(loc1.distanceTo('loc2', graph)).toBe(1);
	});

	it('returns the hop count of the shortest path', () => {
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2'] });
		const graph = makeGraph({ loc1: ['loc2'], loc2: ['loc3'], loc3: [] });

		expect(loc1.distanceTo('loc3', graph)).toBe(2);
	});

	it('returns undefined when no path exists', () => {
		const loc1 = makeLocation({ id: 'loc1', connections: [] });
		const graph = makeGraph({ loc1: [], loc2: [] });

		expect(loc1.distanceTo('loc2', graph)).toBeUndefined();
	});

	it('respects allowedConnections', () => {
		const loc1 = makeLocation({ id: 'loc1', connections: ['loc2'] });
		const graph = makeGraph({ loc1: ['loc2'], loc2: ['loc3'], loc3: [] });

		const result = loc1.distanceTo('loc3', graph, {
			allowedConnections: (origin, dest) => !(origin === 'loc1' && dest === 'loc2')
		});

		expect(result).toBeUndefined();
	});
});
