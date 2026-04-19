import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { Entity } from '../entities';
import type { BooleanExpression } from '../expressions/boolean';
import type { ScalarExpression } from '../expressions/scalar';
import { strength } from '../stats';
import type { MutableCardState, ReadonlyCardState } from './cardstate';
import { ReadonlyGameState, type GameContext } from './gamestate';
import type { CardId, EntityId, LocationId, PlayerId } from './identifiers';
import {
	ReadonlyLocationState,
	type MutableLocationState,
	type ReadonlyLocationState as ReadonlyLocationStateType
} from './locationstate';
import type { MutablePlayerState, ReadonlyPlayerState } from './playerstate';
import { MutableTestResolution, ReadonlyTestResolution } from './testresolution';
import { MutableWoundResolution, ReadonlyWoundResolution } from './woundresolution';

function makeGameState(
	players: ReadonlyPlayerState[],
	locations: ReadonlyLocationStateType[] = []
): ReadonlyGameState {
	return new ReadonlyGameState({ players, locations });
}

function makeLocation(id: LocationId, players: PlayerId[] = []): ReadonlyLocationStateType {
	return new ReadonlyLocationState({
		id,
		card: mock<Entity>(),
		ownerId: 'plr1',
		container: { type: 'location', locationId: id },
		players,
		properties: []
	});
}

function makeTestResolution(proficiency = 0): ReadonlyTestResolution {
	return new ReadonlyTestResolution({ subjectId: 'trt1', proficiency, properties: [] });
}

function makeWoundResolution(damageDealt = 3): ReadonlyWoundResolution {
	return new ReadonlyWoundResolution({ targetId: 'trt1', damageDealt });
}

function makeMutablePlayer(id = 'plr1'): ReadonlyPlayerState {
	const p = mock<ReadonlyPlayerState>();
	p.mutable.mockReturnValue({ id, readonly: () => p } as unknown as MutablePlayerState);
	return p;
}

// ─── GameState.cards ──────────────────────────────────────────────────────────

describe('GameState.cards', () => {
	it('returns all cards across all players', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ cards: () => [c1] }),
			mock<ReadonlyPlayerState>({ cards: () => [c2] })
		]);
		const all = state.cards();
		expect(all).toContain(c1);
		expect(all).toContain(c2);
	});

	it('returns an empty array when all players have no cards', () => {
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ cards: () => [] }),
			mock<ReadonlyPlayerState>({ cards: () => [] })
		]);
		expect(state.cards()).toEqual([]);
	});

	it('includes top-level locations', () => {
		const location = mock<ReadonlyLocationStateType>();
		const state = makeGameState([mock<ReadonlyPlayerState>({ cards: () => [] })], [location]);
		expect(state.cards()).toContain(location);
	});
});

// ─── GameState.getCard ────────────────────────────────────────────────────────

describe('GameState.getCard', () => {
	it('finds a card owned by any player', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) }),
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt2' ? c2 : undefined) })
		]);
		expect(state.getCard('trt1')).toBe(c1);
		expect(state.getCard('trt2')).toBe(c2);
	});

	it('returns undefined for an unknown card id', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getCard('trt99')).toBeUndefined();
	});

	it('finds a location card by id', () => {
		const location = new ReadonlyLocationState({
			id: 'loc9',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'location', locationId: 'loc9' },
			properties: []
		});
		const state = makeGameState([mock<ReadonlyPlayerState>()], [location]);
		expect(state.getCard('loc9')).toBe(location);
	});
});

// ─── GameState.requireCard ────────────────────────────────────────────────────

describe('GameState.requireCard', () => {
	it('returns the card when found', () => {
		const c1 = mock<ReadonlyCardState>();
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) })
		]);
		expect(state.requireCard('trt1')).toBe(c1);
	});

	it('throws when the card does not exist', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireCard('trt99')).toThrow('trt99');
	});
});

// ─── GameState.getPlayer ──────────────────────────────────────────────────────

describe('GameState.getPlayer', () => {
	it('returns the player with the given id', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = makeGameState([p1]);
		expect(state.getPlayer('plr1')).toBe(p1);
	});

	it('returns undefined for an unknown player id', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })]);
		expect(state.getPlayer('plr99')).toBeUndefined();
	});
});

// ─── GameState.requirePlayer ──────────────────────────────────────────────────

describe('GameState.requirePlayer', () => {
	it('returns the player when found', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = makeGameState([p1]);
		expect(state.requirePlayer('plr1')).toBe(p1);
	});

	it('throws when the player does not exist', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })]);
		expect(() => state.requirePlayer('plr99')).toThrow('plr99');
	});
});

// ─── GameState.clockwise ─────────────────────────────────────────────────────

describe('GameState.clockwise', () => {
	it('returns players starting at the requested id and wrapping around', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const p2 = mock<ReadonlyPlayerState>({ id: 'plr2' });
		const p3 = mock<ReadonlyPlayerState>({ id: 'plr3' });
		const state = makeGameState([p1, p2, p3]);
		expect(state.clockwise('plr2')).toEqual(['plr2', 'plr3', 'plr1']);
	});

	it('throws when the requested starting player does not exist', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = makeGameState([p1]);
		expect(() => state.clockwise('plr9')).toThrow('plr9');
	});
});

// ─── GameState.getEntityState ─────────────────────────────────────────────────

describe('GameState.getEntityState', () => {
	it('returns the card state when given a CardId', () => {
		const c1 = mock<ReadonlyCardState>();
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) })
		]);
		expect(state.getEntityState('trt1')).toBe(c1);
	});

	it('returns the player state when given a PlayerId', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = makeGameState([p1]);
		expect(state.getEntityState('plr1')).toBe(p1);
	});

	it('returns undefined for an unknown CardId', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getEntityState('trt99')).toBeUndefined();
	});

	it('returns undefined for an unknown PlayerId', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })]);
		expect(state.getEntityState('plr99')).toBeUndefined();
	});
});

// ─── GameState.requireEntityState ────────────────────────────────────────────

describe('GameState.requireEntityState', () => {
	it('returns the card state when given a CardId', () => {
		const c1 = mock<ReadonlyCardState>();
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) })
		]);
		expect(state.requireEntityState('trt1')).toBe(c1);
	});

	it('returns the player state when given a PlayerId', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = makeGameState([p1]);
		expect(state.requireEntityState('plr1')).toBe(p1);
	});

	it('throws when the CardId is not found', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireEntityState('trt99')).toThrow('trt99');
	});

	it('throws when the PlayerId is not found', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })]);
		expect(() => state.requireEntityState('plr99')).toThrow('plr99');
	});
});

// ─── GameState active card stack ──────────────────────────────────────────────

describe('GameState active card stack', () => {
	it('getActiveCard returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getActiveCard()).toBeUndefined();
	});

	it('requireActiveCard throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireActiveCard()).toThrow();
	});

	it('getActiveCard returns the top card of the stack', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({
			getCard: (id) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
		});
		const state = new ReadonlyGameState({ players: [p1], activeCardStack: ['trt1', 'trt2'] });
		expect(state.getActiveCard()).toBe(c2);
	});

	it('requireActiveCard returns the top card of the stack', () => {
		const c1 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) });
		const state = new ReadonlyGameState({ players: [p1], activeCardStack: ['trt1'] });
		expect(state.requireActiveCard()).toBe(c1);
	});
});

// ─── GameState active player stack ───────────────────────────────────────────

describe('GameState active player stack', () => {
	it('getActivePlayer returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getActivePlayer()).toBeUndefined();
	});

	it('requireActivePlayer throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireActivePlayer()).toThrow();
	});

	it('getActivePlayer returns the top player of the stack', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const p2 = mock<ReadonlyPlayerState>({ id: 'plr2' });
		const state = new ReadonlyGameState({
			players: [p1, p2],
			activePlayerStack: ['plr1', 'plr2']
		});
		expect(state.getActivePlayer()).toBe(p2);
	});

	it('requireActivePlayer returns the top player of the stack', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = new ReadonlyGameState({ players: [p1], activePlayerStack: ['plr1'] });
		expect(state.requireActivePlayer()).toBe(p1);
	});
});

// ─── GameState reactive card stack ───────────────────────────────────────────

describe('GameState reactive card stack', () => {
	it('getReactiveCard returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getReactiveCard()).toBeUndefined();
	});

	it('requireReactiveCard throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireReactiveCard()).toThrow();
	});

	it('getReactiveCard returns the top card of the stack', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({
			getCard: (id) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
		});
		const state = new ReadonlyGameState({ players: [p1], reactiveCardStack: ['trt1', 'trt2'] });
		expect(state.getReactiveCard()).toBe(c2);
	});

	it('requireReactiveCard returns the top card of the stack', () => {
		const c1 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) });
		const state = new ReadonlyGameState({ players: [p1], reactiveCardStack: ['trt1'] });
		expect(state.requireReactiveCard()).toBe(c1);
	});
});

// ─── GameState reactive player stack ─────────────────────────────────────────

describe('GameState reactive player stack', () => {
	it('getReactivePlayer returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getReactivePlayer()).toBeUndefined();
	});

	it('requireReactivePlayer throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireReactivePlayer()).toThrow();
	});

	it('getReactivePlayer returns the top player of the stack', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const p2 = mock<ReadonlyPlayerState>({ id: 'plr2' });
		const state = new ReadonlyGameState({
			players: [p1, p2],
			reactivePlayerStack: ['plr1', 'plr2']
		});
		expect(state.getReactivePlayer()).toBe(p2);
	});

	it('requireReactivePlayer returns the top player of the stack', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = new ReadonlyGameState({ players: [p1], reactivePlayerStack: ['plr1'] });
		expect(state.requireReactivePlayer()).toBe(p1);
	});
});

// ─── GameState implicit target stack ─────────────────────────────────────────

describe('GameState implicit target stack', () => {
	it('getTarget returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getTarget()).toBeUndefined();
	});

	it('requireTarget throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireTarget()).toThrow();
	});

	it('getTarget returns the top card when the top id is a CardId', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({
			getCard: (id) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
		});
		const state = new ReadonlyGameState({ players: [p1], targetStack: ['trt1', 'trt2'] });
		expect(state.getTarget()).toBe(c2);
	});

	it('getTarget returns the top player when the top id is a PlayerId', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const p2 = mock<ReadonlyPlayerState>({ id: 'plr2' });
		const state = new ReadonlyGameState({
			players: [p1, p2],
			targetStack: ['plr1', 'plr2']
		});
		expect(state.getTarget()).toBe(p2);
	});

	it('requireTarget returns the top target', () => {
		const c1 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) });
		const state = new ReadonlyGameState({ players: [p1], targetStack: ['trt1'] });
		expect(state.requireTarget()).toBe(c1);
	});
});

// ─── GameState implicit subject stack ────────────────────────────────────────

describe('GameState implicit subject stack', () => {
	it('getSubject returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getSubject()).toBeUndefined();
	});

	it('requireSubject throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireSubject()).toThrow();
	});

	it('getSubject returns the top card when the top id is a CardId', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({
			getCard: (id) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
		});
		const state = new ReadonlyGameState({ players: [p1], subjectStack: ['trt1', 'trt2'] });
		expect(state.getSubject()).toBe(c2);
	});

	it('getSubject returns the top player when the top id is a PlayerId', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const p2 = mock<ReadonlyPlayerState>({ id: 'plr2' });
		const state = new ReadonlyGameState({
			players: [p1, p2],
			subjectStack: ['plr1', 'plr2']
		});
		expect(state.getSubject()).toBe(p2);
	});

	it('requireSubject returns the top subject', () => {
		const c1 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) });
		const state = new ReadonlyGameState({ players: [p1], subjectStack: ['trt1'] });
		expect(state.requireSubject()).toBe(c1);
	});
});

// ─── GameState test resolution stack ───────────────────────────────────────

describe('GameState test resolution stack', () => {
	it('getActiveTestResolution returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getActiveTestResolution()).toBeUndefined();
	});

	it('requireActiveTestResolution throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireActiveTestResolution()).toThrow();
	});

	it('getActiveTestResolution returns the last element of the stack', () => {
		const r1 = makeTestResolution(1);
		const r2 = makeTestResolution(2);
		const state = new ReadonlyGameState({
			players: [],
			testResolutionStack: [r1, r2]
		});
		expect(state.getActiveTestResolution()).toBe(r2);
	});

	it('requireActiveTestResolution returns the last element of the stack', () => {
		const r1 = makeTestResolution(3);
		const state = new ReadonlyGameState({ players: [], testResolutionStack: [r1] });
		expect(state.requireActiveTestResolution()).toBe(r1);
	});
});

// ─── MutableGameState test resolution stack ─────────────────────────────────

describe('MutableGameState test resolution stack', () => {
	it('is empty when the source stack is empty', () => {
		const state = new ReadonlyGameState({ players: [makeMutablePlayer()] });
		expect(state.mutable().testResolutionStack).toEqual([]);
	});

	it('converts the last element to MutableTestResolution', () => {
		const r1 = makeTestResolution(5);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			testResolutionStack: [r1]
		});
		const mutable = state.mutable();
		expect(mutable.testResolutionStack[0]).toBeInstanceOf(MutableTestResolution);
	});

	it('leaves preceding elements as ReadonlyTestResolution', () => {
		const r1 = makeTestResolution(1);
		const r2 = makeTestResolution(2);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			testResolutionStack: [r1, r2]
		});
		const mutable = state.mutable();
		expect(mutable.testResolutionStack[0]).toBeInstanceOf(ReadonlyTestResolution);
		expect(mutable.testResolutionStack[1]).toBeInstanceOf(MutableTestResolution);
	});

	it('getActiveTestResolution returns the last element as MutableTestResolution', () => {
		const r1 = makeTestResolution(5);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			testResolutionStack: [r1]
		});
		expect(state.mutable().getActiveTestResolution()).toBeInstanceOf(MutableTestResolution);
	});

	it('requireActiveTestResolution returns the last element as MutableTestResolution', () => {
		const r1 = makeTestResolution(5);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			testResolutionStack: [r1]
		});
		expect(state.mutable().requireActiveTestResolution()).toBeInstanceOf(MutableTestResolution);
	});

	it('preserves proficiency values through the mutable conversion', () => {
		const r1 = makeTestResolution(3);
		const r2 = makeTestResolution(7);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			testResolutionStack: [r1, r2]
		});
		const mutable = state.mutable();
		expect(mutable.testResolutionStack[0].proficiency).toBe(3);
		expect(mutable.testResolutionStack[1].proficiency).toBe(7);
	});

	it('readonly() converts the last element back to ReadonlyTestResolution', () => {
		const r1 = makeTestResolution(5);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			testResolutionStack: [r1]
		});
		const roundTripped = state.mutable().readonly();
		expect(roundTripped.testResolutionStack[0]).toBeInstanceOf(ReadonlyTestResolution);
	});

	it('readonly() preserves preceding ReadonlyTestResolution elements', () => {
		const r1 = makeTestResolution(1);
		const r2 = makeTestResolution(2);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			testResolutionStack: [r1, r2]
		});
		const roundTripped = state.mutable().readonly();
		expect(roundTripped.testResolutionStack).toHaveLength(2);
		expect(roundTripped.testResolutionStack[0]).toBeInstanceOf(ReadonlyTestResolution);
		expect(roundTripped.testResolutionStack[1]).toBeInstanceOf(ReadonlyTestResolution);
	});

	it('requireActiveTestResolution throws when the stack is empty', () => {
		const state = new ReadonlyGameState({ players: [makeMutablePlayer()] });
		expect(() => state.mutable().requireActiveTestResolution()).toThrow();
	});
});

// ─── GameState.evaluate ───────────────────────────────────────────────────────

describe('GameState.evaluate', () => {
	it('returns a boolean literal unchanged', () => {
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluate(true)).toBe(true);
		expect(state.evaluate(false)).toBe(false);
	});

	it('returns a number literal unchanged', () => {
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluate(7)).toBe(7);
	});

	it('returns the active player stat value for a Stat', () => {
		const player = mock<ReadonlyPlayerState>({
			id: 'plr1',
			getStat: (stat) => (stat === strength ? 4 : 0)
		});
		const state = new ReadonlyGameState({ players: [player], activePlayerStack: ['plr1'] });
		expect(state.evaluate(strength)).toBe(4);
	});

	it('delegates to a BooleanExpression', () => {
		const expr = mock<BooleanExpression>();
		expr.evaluate.mockReturnValue(true);
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluate(expr)).toBe(true);
		expect(expr.evaluate).toHaveBeenCalledWith(state);
	});

	it('delegates to a ScalarExpression', () => {
		const expr = mock<ScalarExpression>();
		expr.evaluate.mockReturnValue(5);
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluate(expr)).toBe(5);
		expect(expr.evaluate).toHaveBeenCalledWith(state);
	});
});

// ─── ReadonlyGameState.mutable / mutate ───────────────────────────────────────

describe('ReadonlyGameState', () => {
	describe('mutable', () => {
		it('produces a mutable copy with the same players', () => {
			const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = makeGameState([p1]);
			const mutable = state.mutable();
			expect(mutable.players).toMatchObject([{ id: 'plr1' }]);
		});

		it('copies the active card stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], activeCardStack: ['trt1'] });
			const mutable = state.mutable();
			expect(mutable.activeCardStack).toEqual(['trt1']);
		});

		it('copies the active player stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], activePlayerStack: ['plr1'] });
			const mutable = state.mutable();
			expect(mutable.activePlayerStack).toEqual(['plr1']);
		});

		it('copies the reactive card stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], reactiveCardStack: ['trt1'] });
			const mutable = state.mutable();
			expect(mutable.reactiveCardStack).toEqual(['trt1']);
		});

		it('copies the reactive player stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], reactivePlayerStack: ['plr1'] });
			const mutable = state.mutable();
			expect(mutable.reactivePlayerStack).toEqual(['plr1']);
		});

		it('copies the implicit target stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], targetStack: ['trt1'] });
			const mutable = state.mutable();
			expect(mutable.targetStack).toEqual(['trt1']);
		});

		it('copies the implicit subject stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], subjectStack: ['trt1'] });
			const mutable = state.mutable();
			expect(mutable.subjectStack).toEqual(['trt1']);
		});

		it('copies the test resolution stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const r1 = makeTestResolution(2);
			const state = new ReadonlyGameState({
				players: [p1],
				testResolutionStack: [r1]
			});
			const mutable = state.mutable();
			expect(mutable.testResolutionStack).toHaveLength(1);
		});

		it('copies locations', () => {
			const p1 = mock<ReadonlyPlayerState>();
			const location = mock<ReadonlyLocationState>({ id: 'loc9' });
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			location.mutable.mockReturnValue({
				id: 'loc9',
				readonly: () => location
			} as unknown as MutableLocationState);
			const state = makeGameState([p1], [location]);
			const mutable = state.mutable();

			expect(mutable.locations).toMatchObject([{ id: 'loc9' }]);
		});

		it('converts encounter deck cards to mutable', () => {
			const card = mock<ReadonlyCardState>();
			const mutableCard = mock<MutableCardState>();
			card.mutable.mockReturnValue(mutableCard);
			const state = new ReadonlyGameState({
				players: [makeMutablePlayer()],
				encounterDeck: [card]
			});
			expect(state.mutable().encounterDeck[0]).toBe(mutableCard);
		});

		it('converts encounter discard pile cards to mutable', () => {
			const card = mock<ReadonlyCardState>();
			const mutableCard = mock<MutableCardState>();
			card.mutable.mockReturnValue(mutableCard);
			const state = new ReadonlyGameState({
				players: [makeMutablePlayer()],
				encounterDiscardPile: [card]
			});
			expect(state.mutable().encounterDiscardPile[0]).toBe(mutableCard);
		});
	});

	describe('mutate', () => {
		it('applies the change and returns a new ReadonlyGameState', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = makeGameState([p1]);
			const updated = state.mutate((m) => {
				m.activePlayerStack.push('plr1');
			});
			expect(updated).toBeInstanceOf(ReadonlyGameState);
			expect(updated.activePlayerStack).toContain('plr1');
		});

		it('does not mutate the original', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = makeGameState([p1]);
			state.mutate((m) => {
				m.activePlayerStack.push('plr1');
			});
			expect(state.activePlayerStack).toEqual([]);
		});
	});
});

// ─── MutableGameState.pushContext / popContext ────────────────────────────────

function makeMutableState(overrides?: {
	activeCardStack?: CardId[];
	activePlayerStack?: PlayerId[];
	reactiveCardStack?: CardId[];
	reactivePlayerStack?: PlayerId[];
	subjectStack?: EntityId[];
	targetStack?: EntityId[];
}): ReturnType<ReadonlyGameState['mutable']> {
	const p1 = mock<ReadonlyPlayerState>();
	p1.mutable.mockReturnValue({ id: 'plr1', readonly: () => p1 } as unknown as MutablePlayerState);
	return new ReadonlyGameState({ players: [p1], ...overrides }).mutable();
}

describe('MutableGameState.pushContext', () => {
	it('pushes activeCardId onto activeCardStack', () => {
		const state = makeMutableState();
		state.pushContext({ activeCardId: 'trt1' });
		expect(state.activeCardStack).toEqual(['trt1']);
	});

	it('pushes activePlayerId onto activePlayerStack', () => {
		const state = makeMutableState();
		state.pushContext({ activePlayerId: 'plr1' });
		expect(state.activePlayerStack).toEqual(['plr1']);
	});

	it('pushes reactiveCardId onto reactiveCardStack', () => {
		const state = makeMutableState();
		state.pushContext({ reactiveCardId: 'trt1' });
		expect(state.reactiveCardStack).toEqual(['trt1']);
	});

	it('pushes reactivePlayerId onto reactivePlayerStack', () => {
		const state = makeMutableState();
		state.pushContext({ reactivePlayerId: 'plr1' });
		expect(state.reactivePlayerStack).toEqual(['plr1']);
	});

	it('pushes subjectId onto subjectStack', () => {
		const state = makeMutableState();
		state.pushContext({ subjectId: 'plr1' });
		expect(state.subjectStack).toEqual(['plr1']);
	});

	it('pushes targetId onto targetStack', () => {
		const state = makeMutableState();
		state.pushContext({ targetId: 'trt1' });
		expect(state.targetStack).toEqual(['trt1']);
	});

	it('pushes all provided fields at once', () => {
		const state = makeMutableState();
		state.pushContext({
			activeCardId: 'trt1',
			activePlayerId: 'plr1',
			reactiveCardId: 'trt2',
			reactivePlayerId: 'plr2',
			subjectId: 'plr1',
			targetId: 'trt1'
		});
		expect(state.activeCardStack).toEqual(['trt1']);
		expect(state.activePlayerStack).toEqual(['plr1']);
		expect(state.reactiveCardStack).toEqual(['trt2']);
		expect(state.reactivePlayerStack).toEqual(['plr2']);
		expect(state.subjectStack).toEqual(['plr1']);
		expect(state.targetStack).toEqual(['trt1']);
	});

	it('does not touch stacks for undefined fields', () => {
		const state = makeMutableState({ activeCardStack: ['trt9'] });
		state.pushContext({ reactiveCardId: 'trt1' });
		expect(state.activeCardStack).toEqual(['trt9']);
		expect(state.reactiveCardStack).toEqual(['trt1']);
	});

	it('pushes onto existing stack entries', () => {
		const state = makeMutableState({ reactiveCardStack: ['trt1'] });
		state.pushContext({ reactiveCardId: 'trt2' });
		expect(state.reactiveCardStack).toEqual(['trt1', 'trt2']);
	});
});

describe('MutableGameState.popContext', () => {
	it('pops activeCardId from activeCardStack', () => {
		const state = makeMutableState({ activeCardStack: ['trt1'] });
		state.popContext({ activeCardId: 'trt1' });
		expect(state.activeCardStack).toEqual([]);
	});

	it('pops reactiveCardId from reactiveCardStack', () => {
		const state = makeMutableState({ reactiveCardStack: ['trt1'] });
		state.popContext({ reactiveCardId: 'trt1' });
		expect(state.reactiveCardStack).toEqual([]);
	});

	it('pops reactivePlayerId from reactivePlayerStack', () => {
		const state = makeMutableState({ reactivePlayerStack: ['plr1'] });
		state.popContext({ reactivePlayerId: 'plr1' });
		expect(state.reactivePlayerStack).toEqual([]);
	});

	it('pops all provided fields in reverse order', () => {
		const state = makeMutableState({
			activeCardStack: ['trt1'],
			activePlayerStack: ['plr1'],
			reactiveCardStack: ['trt2'],
			reactivePlayerStack: ['plr2'],
			subjectStack: ['plr1'],
			targetStack: ['trt1']
		});
		state.popContext({
			activeCardId: 'trt1',
			activePlayerId: 'plr1',
			reactiveCardId: 'trt2',
			reactivePlayerId: 'plr2',
			subjectId: 'plr1',
			targetId: 'trt1'
		});
		expect(state.activeCardStack).toEqual([]);
		expect(state.activePlayerStack).toEqual([]);
		expect(state.reactiveCardStack).toEqual([]);
		expect(state.reactivePlayerStack).toEqual([]);
		expect(state.subjectStack).toEqual([]);
		expect(state.targetStack).toEqual([]);
	});

	it('does not touch stacks for undefined fields', () => {
		const state = makeMutableState({ activeCardStack: ['trt9'], reactiveCardStack: ['trt1'] });
		state.popContext({ reactiveCardId: 'trt1' });
		expect(state.activeCardStack).toEqual(['trt9']);
		expect(state.reactiveCardStack).toEqual([]);
	});

	it('only pops the top entry, leaving preceding entries intact', () => {
		const state = makeMutableState({ reactiveCardStack: ['trt1', 'trt2'] });
		state.popContext({ reactiveCardId: 'trt2' });
		expect(state.reactiveCardStack).toEqual(['trt1']);
	});
});

describe('MutableGameState pushContext / popContext round-trip', () => {
	it('restores all stacks to their original state', () => {
		const ctx: GameContext = {
			activeCardId: 'trt1',
			activePlayerId: 'plr1',
			reactiveCardId: 'trt2',
			reactivePlayerId: 'plr2',
			subjectId: 'plr1',
			targetId: 'trt1'
		};
		const state = makeMutableState();
		state.pushContext(ctx);
		state.popContext(ctx);
		expect(state.activeCardStack).toEqual([]);
		expect(state.activePlayerStack).toEqual([]);
		expect(state.reactiveCardStack).toEqual([]);
		expect(state.reactivePlayerStack).toEqual([]);
		expect(state.subjectStack).toEqual([]);
		expect(state.targetStack).toEqual([]);
	});

	it('preserves pre-existing entries after a push/pop cycle', () => {
		const state = makeMutableState({
			reactiveCardStack: ['trt9'],
			reactivePlayerStack: ['plr9']
		});
		const ctx: GameContext = { reactiveCardId: 'trt1', reactivePlayerId: 'plr1' };
		state.pushContext(ctx);
		state.popContext(ctx);
		expect(state.reactiveCardStack).toEqual(['trt9']);
		expect(state.reactivePlayerStack).toEqual(['plr9']);
	});
});

// ─── GameState.getPlayerLocation ─────────────────────────────────────────────

describe('GameState.getPlayerLocation', () => {
	it('returns the location containing the player when given a PlayerId', () => {
		const loc1 = makeLocation('loc1', ['plr1']);
		const loc2 = makeLocation('loc2');
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })], [loc1, loc2]);

		expect(state.getPlayerLocation('plr1')).toBe(loc1);
	});

	it('returns the location containing the player when given a player object', () => {
		const loc1 = makeLocation('loc1', ['plr1']);
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = makeGameState([p1], [loc1]);

		expect(state.getPlayerLocation(p1)).toBe(loc1);
	});

	it('returns undefined when the player is not in any location', () => {
		const loc1 = makeLocation('loc1');
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })], [loc1]);

		expect(state.getPlayerLocation('plr1')).toBeUndefined();
	});
});

// ─── MutableGameState.setPlayerLocation ──────────────────────────────────────

describe('MutableGameState.setPlayerLocation', () => {
	it('adds the player to the destination when not in any location', () => {
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer('plr1')],
			locations: [makeLocation('loc1')]
		}).mutable();

		state.setPlayerLocation('plr1', 'loc1');

		expect(state.locations[0].players).toContain('plr1');
	});

	it('removes the player from the origin and adds them to the destination', () => {
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer('plr1')],
			locations: [makeLocation('loc1', ['plr1']), makeLocation('loc2')]
		}).mutable();

		state.setPlayerLocation('plr1', 'loc2');

		expect(state.locations[0].players).not.toContain('plr1');
		expect(state.locations[1].players).toContain('plr1');
	});

	it('accepts player and location objects in place of ids', () => {
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer('plr1')],
			locations: [makeLocation('loc1', ['plr1']), makeLocation('loc2')]
		}).mutable();
		const player = state.players[0];
		const destination = state.locations[1];

		state.setPlayerLocation(player, destination);

		expect(state.locations[0].players).not.toContain('plr1');
		expect(state.locations[1].players).toContain('plr1');
	});
});

// ─── GameState encounterDeck / encounterDiscardPile ───────────────────────────

describe('GameState encounterDeck', () => {
	it('defaults to an empty array when not provided', () => {
		const state = makeGameState([]);
		expect(state.encounterDeck).toEqual([]);
	});

	it('stores provided encounter deck cards', () => {
		const card = mock<ReadonlyCardState>();
		const state = new ReadonlyGameState({ players: [], encounterDeck: [card] });
		expect(state.encounterDeck[0]).toBe(card);
	});
});

describe('GameState encounterDiscardPile', () => {
	it('defaults to an empty array when not provided', () => {
		const state = makeGameState([]);
		expect(state.encounterDiscardPile).toEqual([]);
	});

	it('stores provided encounter discard pile cards', () => {
		const card = mock<ReadonlyCardState>();
		const state = new ReadonlyGameState({ players: [], encounterDiscardPile: [card] });
		expect(state.encounterDiscardPile[0]).toBe(card);
	});
});

// ─── MutableGameState wound resolution stack ──────────────────────────────────

describe('MutableGameState wound resolution stack', () => {
	it('is empty when the source stack is empty', () => {
		const state = new ReadonlyGameState({ players: [makeMutablePlayer()] });
		expect(state.mutable().woundResolutionStack).toEqual([]);
	});

	it('converts the last element to MutableWoundResolution', () => {
		const w1 = makeWoundResolution(5);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			woundResolutionStack: [w1]
		});
		const mutable = state.mutable();
		expect(mutable.woundResolutionStack[0]).toBeInstanceOf(MutableWoundResolution);
	});

	it('leaves preceding elements as ReadonlyWoundResolution', () => {
		const w1 = makeWoundResolution(1);
		const w2 = makeWoundResolution(2);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			woundResolutionStack: [w1, w2]
		});
		const mutable = state.mutable();
		expect(mutable.woundResolutionStack[0]).toBeInstanceOf(ReadonlyWoundResolution);
		expect(mutable.woundResolutionStack[1]).toBeInstanceOf(MutableWoundResolution);
	});

	it('getActiveWoundResolution returns undefined when the stack is empty', () => {
		const state = new ReadonlyGameState({ players: [makeMutablePlayer()] });
		expect(state.mutable().getActiveWoundResolution()).toBeUndefined();
	});

	it('getActiveWoundResolution returns the last element as MutableWoundResolution', () => {
		const w1 = makeWoundResolution(4);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			woundResolutionStack: [w1]
		});
		expect(state.mutable().getActiveWoundResolution()).toBeInstanceOf(MutableWoundResolution);
	});

	it('requireActiveWoundResolution throws when the stack is empty', () => {
		const state = new ReadonlyGameState({ players: [makeMutablePlayer()] });
		expect(() => state.mutable().requireActiveWoundResolution()).toThrow();
	});

	it('requireActiveWoundResolution returns the last element as MutableWoundResolution', () => {
		const w1 = makeWoundResolution(3);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			woundResolutionStack: [w1]
		});
		expect(state.mutable().requireActiveWoundResolution()).toBeInstanceOf(MutableWoundResolution);
	});

	it('preserves damageDealt values through the mutable conversion', () => {
		const w1 = makeWoundResolution(3);
		const w2 = makeWoundResolution(7);
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			woundResolutionStack: [w1, w2]
		});
		const mutable = state.mutable();
		expect(mutable.woundResolutionStack[0].damageDealt).toBe(3);
		expect(mutable.woundResolutionStack[1].damageDealt).toBe(7);
	});
});
