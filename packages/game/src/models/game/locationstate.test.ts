import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { Entity } from '../entities';
import { MutableCardState, ReadonlyCardState } from './cardstate';
import type { LocationId, PlayerId } from './identifiers';
import { MutableLocationState, ReadonlyLocationState } from './locationstate';

function makeLocation(overrides?: {
	id?: LocationId;
	clues?: number;
	players?: Array<PlayerId>;
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
