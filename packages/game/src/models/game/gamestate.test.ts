import { describe, expect, it } from 'vitest';
import { mock } from '@songsofdoom/common/test-utils';
import type { BooleanExpression } from '../expressions/boolean';
import type { ScalarExpression } from '../expressions/scalar';
import { strength } from '../stats';
import type { ReadonlyCardState } from './cardstate';
import { ReadonlyGameState } from './gamestate';
import type { MutablePlayerState, ReadonlyPlayerState } from './playerstate';

function makeGameState(players: ReadonlyPlayerState[]): ReadonlyGameState {
	return new ReadonlyGameState({ players });
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
});

// ─── GameState.getCard ────────────────────────────────────────────────────────

describe('GameState.getCard', () => {
	it('finds a card owned by any player', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'c1' ? c1 : undefined) }),
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'c2' ? c2 : undefined) })
		]);
		expect(state.getCard('c1')).toBe(c1);
		expect(state.getCard('c2')).toBe(c2);
	});

	it('returns undefined for an unknown card id', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getCard('c99')).toBeUndefined();
	});
});

// ─── GameState.requireCard ────────────────────────────────────────────────────

describe('GameState.requireCard', () => {
	it('returns the card when found', () => {
		const c1 = mock<ReadonlyCardState>();
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'c1' ? c1 : undefined) })
		]);
		expect(state.requireCard('c1')).toBe(c1);
	});

	it('throws when the card does not exist', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireCard('c99')).toThrow('c99');
	});
});

// ─── GameState.getPlayer ──────────────────────────────────────────────────────

describe('GameState.getPlayer', () => {
	it('returns the player with the given id', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'p1' });
		const state = makeGameState([p1]);
		expect(state.getPlayer('p1')).toBe(p1);
	});

	it('returns undefined for an unknown player id', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'p1' })]);
		expect(state.getPlayer('p99')).toBeUndefined();
	});
});

// ─── GameState.requirePlayer ──────────────────────────────────────────────────

describe('GameState.requirePlayer', () => {
	it('returns the player when found', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'p1' });
		const state = makeGameState([p1]);
		expect(state.requirePlayer('p1')).toBe(p1);
	});

	it('throws when the player does not exist', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'p1' })]);
		expect(() => state.requirePlayer('p99')).toThrow('p99');
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
			getCard: (id) => (id === 'c1' ? c1 : id === 'c2' ? c2 : undefined)
		});
		const state = new ReadonlyGameState({ players: [p1], activeCardStack: ['c1', 'c2'] });
		expect(state.getActiveCard()).toBe(c2);
	});

	it('requireActiveCard returns the top card of the stack', () => {
		const c1 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'c1' ? c1 : undefined) });
		const state = new ReadonlyGameState({ players: [p1], activeCardStack: ['c1'] });
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
		const p1 = mock<ReadonlyPlayerState>({ id: 'p1' });
		const p2 = mock<ReadonlyPlayerState>({ id: 'p2' });
		const state = new ReadonlyGameState({
			players: [p1, p2],
			activePlayerStack: ['p1', 'p2']
		});
		expect(state.getActivePlayer()).toBe(p2);
	});

	it('requireActivePlayer returns the top player of the stack', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'p1' });
		const state = new ReadonlyGameState({ players: [p1], activePlayerStack: ['p1'] });
		expect(state.requireActivePlayer()).toBe(p1);
	});
});

// ─── GameState implicit target stack ─────────────────────────────────────────

describe('GameState implicit target stack', () => {
	it('getImplicitTarget returns undefined when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(state.getImplicitTarget()).toBeUndefined();
	});

	it('requireImplicitTarget throws when the stack is empty', () => {
		const state = makeGameState([mock<ReadonlyPlayerState>()]);
		expect(() => state.requireImplicitTarget()).toThrow();
	});

	it('getImplicitTarget returns the top card when the top id is a CardId', () => {
		const c1 = mock<ReadonlyCardState>();
		const c2 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({
			getCard: (id) => (id === 'c1' ? c1 : id === 'c2' ? c2 : undefined)
		});
		const state = new ReadonlyGameState({ players: [p1], implicitTargetStack: ['c1', 'c2'] });
		expect(state.getImplicitTarget()).toBe(c2);
	});

	it('getImplicitTarget returns the top player when the top id is a PlayerId', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'p1' });
		const p2 = mock<ReadonlyPlayerState>({ id: 'p2' });
		const state = new ReadonlyGameState({
			players: [p1, p2],
			implicitTargetStack: ['p1', 'p2']
		});
		expect(state.getImplicitTarget()).toBe(p2);
	});

	it('requireImplicitTarget returns the top target', () => {
		const c1 = mock<ReadonlyCardState>();
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'c1' ? c1 : undefined) });
		const state = new ReadonlyGameState({ players: [p1], implicitTargetStack: ['c1'] });
		expect(state.requireImplicitTarget()).toBe(c1);
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
			id: 'p1',
			getStat: (stat) => (stat === strength ? 4 : 0)
		});
		const state = new ReadonlyGameState({ players: [player], activePlayerStack: ['p1'] });
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
			const p1 = mock<ReadonlyPlayerState>({ id: 'p1' });
			p1.mutable.mockReturnValue({ id: 'p1', readonly: () => p1 } as unknown as MutablePlayerState);
			const state = makeGameState([p1]);
			const mutable = state.mutable();
			expect(mutable.players).toMatchObject([{ id: 'p1' }]);
		});

		it('copies the active card stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({ id: 'p1', readonly: () => p1 } as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], activeCardStack: ['c1'] });
			const mutable = state.mutable();
			expect(mutable.activeCardStack).toEqual(['c1']);
		});

		it('copies the active player stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({ id: 'p1', readonly: () => p1 } as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], activePlayerStack: ['p1'] });
			const mutable = state.mutable();
			expect(mutable.activePlayerStack).toEqual(['p1']);
		});

		it('copies the implicit target stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({ id: 'p1', readonly: () => p1 } as unknown as MutablePlayerState);
			const state = new ReadonlyGameState({ players: [p1], implicitTargetStack: ['c1'] });
			const mutable = state.mutable();
			expect(mutable.implicitTargetStack).toEqual(['c1']);
		});
	});

	describe('mutate', () => {
		it('applies the change and returns a new ReadonlyGameState', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({ id: 'p1', readonly: () => p1 } as unknown as MutablePlayerState);
			const state = makeGameState([p1]);
			const updated = state.mutate((m) => {
				m.activePlayerStack.push('p1');
			});
			expect(updated).toBeInstanceOf(ReadonlyGameState);
			expect(updated.activePlayerStack).toContain('p1');
		});

		it('does not mutate the original', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({ id: 'p1', readonly: () => p1 } as unknown as MutablePlayerState);
			const state = makeGameState([p1]);
			state.mutate((m) => {
				m.activePlayerStack.push('p1');
			});
			expect(state.activePlayerStack).toEqual([]);
		});
	});
});
