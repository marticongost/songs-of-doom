import { mock } from '@songsofdoom/common/test-utils';
import type { PlaceLocationEffect, PlaceLocationEffectProps } from '@songsofdoom/game';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComputeStep } from '../../core/steps';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { MutableLocationState } from '../../state/locationstate';
import type { PlaceLocationEffectState } from './placelocationproc';

// ─── Module-level mocks ─────────────────────────────────────────────────────

vi.mock('@songsofdoom/game', async () => {
	const actual = await vi.importActual<typeof import('@songsofdoom/game')>('@songsofdoom/game');
	return {
		...actual,
		entities: {
			require: vi.fn()
		}
	};
});

const { entities, normaliseMapConnection } = await import('@songsofdoom/game');
const mockedRequire = entities.require as ReturnType<typeof vi.fn>;

// Must import procedure after mock so it picks up mocked entities
const { placeLocationEffectProc } = await import('./placelocationproc');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMutableGame(existingLocations: MutableLocationState[] = []): MutableGameState & {
	_createCardState: (entity: unknown) => MutableLocationState;
} {
	let nextId = existingLocations.length;
	const mutableGame = mock<MutableGameState>({
		locations: existingLocations,
		createCardState: (entity: unknown) => {
			nextId++;
			const id = `loc${nextId}`;
			const newLoc = mock<MutableLocationState>({
				id: id as never,
				card: entity as never,
				connections: [] as never,
				coordinates: { x: 0, y: 0 }
			}) as unknown as MutableLocationState;
			return newLoc;
		}
	}) as unknown as MutableGameState & {
		_createCardState: (entity: unknown) => MutableLocationState;
	};
	return mutableGame;
}

function makeReadonlyGame(mutableGame: MutableGameState): ReadonlyGameState {
	return mock<ReadonlyGameState>({
		mutate: (cb: (game: MutableGameState) => void) => {
			cb(mutableGame);
			return mock<ReadonlyGameState>();
		}
	}) as unknown as ReadonlyGameState;
}

function makeEffect(props: PlaceLocationEffectProps): PlaceLocationEffect {
	return mock<PlaceLocationEffect>(props);
}

function makeState(effect: PlaceLocationEffect, game: ReadonlyGameState): PlaceLocationEffectState {
	return { effect, game, status: 'ongoing' } as PlaceLocationEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('placeLocationEffectProc', () => {
	const placeLocationStep = placeLocationEffectProc.steps
		.placeLocation as ComputeStep<PlaceLocationEffectState>;
	const emitEventStep = placeLocationEffectProc.steps.emitEvent;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('normaliseMapConnection', () => {
		it('treats a plain string as bidirectional', () => {
			const result = normaliseMapConnection('other-location');
			expect(result).toEqual({ target: 'other-location', direction: 'bidirectional' });
		});

		it('preserves explicit direction', () => {
			const result = normaliseMapConnection({
				target: 'other',
				direction: 'toTargetOnly'
			});
			expect(result).toEqual({ target: 'other', direction: 'toTargetOnly' });
		});

		it('defaults missing direction to bidirectional', () => {
			const result = normaliseMapConnection({ target: 'other' });
			expect(result).toEqual({ target: 'other', direction: 'bidirectional' });
		});
	});

	describe('placeLocation step', () => {
		it('places a new location with the given coordinates', () => {
			mockedRequire.mockReturnValue({ type: { id: 'location' } });

			const effect = makeEffect({
				id: 'forest',
				coordinates: { x: 3, y: 5 },
				connections: []
			});
			const game = makeReadonlyGame(makeMutableGame());
			const state = makeState(effect, game);

			const result = placeLocationStep.logic(state);
			expect(result).toBeDefined();
			expect(result!.locationId).toBe('loc1');
			expect(mockedRequire).toHaveBeenCalledWith('forest');
		});

		it('throws if the entity is not a location', () => {
			mockedRequire.mockReturnValue({ type: { id: 'creature' } });

			const effect = makeEffect({
				id: 'not-a-location',
				coordinates: { x: 0, y: 0 },
				connections: []
			});
			const game = makeReadonlyGame(makeMutableGame());
			const state = makeState(effect, game);

			expect(() => placeLocationStep.logic(state)).toThrow(/not a location/);
			expect(mockedRequire).toHaveBeenCalledWith('not-a-location');
		});

		it('connects two locations bidirectionally', () => {
			mockedRequire.mockReturnValue({ type: { id: 'location' } });

			const existingLoc = mock<MutableLocationState>({
				id: 'loc0' as never,
				card: { id: 'village' } as never,
				connections: [] as never
			}) as unknown as MutableLocationState;

			const mutableGame = makeMutableGame([existingLoc]);
			const game = makeReadonlyGame(mutableGame);

			const effect = makeEffect({
				id: 'forest',
				coordinates: { x: 0, y: 0 },
				connections: ['village']
			});
			const state = makeState(effect, game);

			const result = placeLocationStep.logic(state);
			expect(result).toBeDefined();
			expect(result!.locationId).toBe('loc2');

			// The new location (loc2) should be connected to loc0 and vice versa.
			expect(mutableGame.locations).toHaveLength(2);
			const newLoc = mutableGame.locations[1];
			expect(newLoc.connections).toContain('loc0');
			expect(existingLoc.connections).toContain('loc2');
		});

		it('supports toTargetOnly direction (one-way)', () => {
			mockedRequire.mockReturnValue({ type: { id: 'location' } });

			const existingLoc = mock<MutableLocationState>({
				id: 'loc0' as never,
				card: { id: 'village' } as never,
				connections: [] as never
			}) as unknown as MutableLocationState;

			const mutableGame = makeMutableGame([existingLoc]);
			const game = makeReadonlyGame(mutableGame);

			const effect = makeEffect({
				id: 'forest',
				coordinates: { x: 0, y: 0 },
				connections: [{ target: 'village', direction: 'toTargetOnly' }]
			});
			const state = makeState(effect, game);

			placeLocationStep.logic(state);

			const newLoc = mutableGame.locations[1];
			expect(newLoc.connections).toContain('loc0');
			expect(existingLoc.connections).not.toContain('loc2');
		});

		it('supports toOriginOnly direction (reverse one-way)', () => {
			mockedRequire.mockReturnValue({ type: { id: 'location' } });

			const existingLoc = mock<MutableLocationState>({
				id: 'loc0' as never,
				card: { id: 'village' } as never,
				connections: [] as never
			}) as unknown as MutableLocationState;

			const mutableGame = makeMutableGame([existingLoc]);
			const game = makeReadonlyGame(mutableGame);

			const effect = makeEffect({
				id: 'forest',
				coordinates: { x: 0, y: 0 },
				connections: [{ target: 'village', direction: 'toOriginOnly' }]
			});
			const state = makeState(effect, game);

			placeLocationStep.logic(state);

			const newLoc = mutableGame.locations[1];
			expect(newLoc.connections).not.toContain('loc0');
			expect(existingLoc.connections).toContain('loc2');
		});

		it('throws if the target location is not on the map', () => {
			mockedRequire.mockReturnValue({ type: { id: 'location' } });

			const effect = makeEffect({
				id: 'forest',
				coordinates: { x: 0, y: 0 },
				connections: ['nonexistent']
			});
			const game = makeReadonlyGame(makeMutableGame());
			const state = makeState(effect, game);

			expect(() => placeLocationStep.logic(state)).toThrow(
				/no location with card ID "nonexistent"/
			);
		});
	});

	describe('emitEvent step', () => {
		it('emits locationPlayed with the new location as subject', () => {
			expect(emitEventStep).toBeDefined();
		});
	});
});
