import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { Entity } from '../entities';
import type { BooleanExpression } from '../expressions/boolean';
import type { ScalarExpression } from '../expressions/scalar';
import { strength } from '../stats';
import type { ReadonlyCardState } from './cardstate';
import { ReadonlyGameState } from './gamestate';
import {
	ReadonlyLocationState,
	type MutableLocationState,
	type ReadonlyLocationState as ReadonlyLocationStateType
} from './locationstate';
import type { MutablePlayerState, ReadonlyPlayerState } from './playerstate';
import { MutableTestResolution, ReadonlyTestResolution } from './testresolution';

function makeGameState(
	players: ReadonlyPlayerState[],
	locations: ReadonlyLocationStateType[] = []
): ReadonlyGameState {
	return new ReadonlyGameState({ players, locations });
}

function makeTestResolution(proficiency = 0): ReadonlyTestResolution {
	return new ReadonlyTestResolution({ subjectId: 'trt1', proficiency, properties: [] });
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
