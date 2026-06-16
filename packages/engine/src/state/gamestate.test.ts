import { mock } from '@songsofdoom/common/test-utils';
import {
	Action,
	Constant,
	modifyConcentration,
	not,
	Opportunity,
	plus,
	Scenario,
	strength,
	type Entity
} from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import {
	MutableCapabilityResolution,
	ReadonlyCapabilityResolution,
	type CapabilityResolution
} from './capabilityresolution';
import type { MutableCardState, ReadonlyCardState } from './cardstate';
import { ReadonlyGameState, type GameContext } from './gamestate';
import type { CardId, EntityId, LocationId } from './identifiers';
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

function makeLocation(id: LocationId, players: EntityId[] = []): ReadonlyLocationStateType {
	return new ReadonlyLocationState({
		id,
		card: mock<Entity>(),
		ownerId: 'plr1',
		container: { type: 'location', locationId: id },
		players,
		properties: [],
		coordinates: { x: 0, y: 0 }
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
		const c1 = mock<ReadonlyCardState>({ attachments: [] });
		const c2 = mock<ReadonlyCardState>({ attachments: [] });
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
		const location = mock<ReadonlyLocationStateType>({ attachments: [] });
		const state = makeGameState([mock<ReadonlyPlayerState>({ cards: () => [] })], [location]);
		expect(state.cards()).toContain(location);
	});

	it('includes encounter deck cards', () => {
		const c1 = mock<ReadonlyCardState>({ attachments: [] });
		const state = new ReadonlyGameState({
			players: [mock<ReadonlyPlayerState>({ cards: () => [] })],
			encounterDeck: [c1]
		});
		expect(state.cards()).toContain(c1);
	});

	it('includes encounter discard pile cards', () => {
		const c1 = mock<ReadonlyCardState>({ attachments: [] });
		const state = new ReadonlyGameState({
			players: [mock<ReadonlyPlayerState>({ cards: () => [] })],
			encounterDiscardPile: [c1]
		});
		expect(state.cards()).toContain(c1);
	});

	it('with ready:true excludes encounter deck and discard pile', () => {
		const deckCard = mock<ReadonlyCardState>({ attachments: [] });
		const discardCard = mock<ReadonlyCardState>({ attachments: [] });
		const state = new ReadonlyGameState({
			players: [mock<ReadonlyPlayerState>({ cards: () => [] })],
			encounterDeck: [deckCard],
			encounterDiscardPile: [discardCard]
		});
		const ready = state.cards({ ready: true });
		expect(ready).not.toContain(deckCard);
		expect(ready).not.toContain(discardCard);
	});

	it('with ready:true skips exhausted location cards', () => {
		const readyLocation = mock<ReadonlyLocationStateType>({ attachments: [], exhausted: false });
		const exhaustedLocation = mock<ReadonlyLocationStateType>({ attachments: [], exhausted: true });
		const state = makeGameState(
			[mock<ReadonlyPlayerState>({ cards: () => [] })],
			[readyLocation, exhaustedLocation]
		);
		const ready = state.cards({ ready: true });
		expect(ready).toContain(readyLocation);
		expect(ready).not.toContain(exhaustedLocation);
	});

	it('filters by entity type', () => {
		const skillCard = mock<ReadonlyCardState>({
			attachments: [],
			card: { type: { id: 'skill' } } as Entity
		});
		const itemCard = mock<ReadonlyCardState>({
			attachments: [],
			card: { type: { id: 'item' } } as Entity
		});
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ cards: () => [skillCard, itemCard] })
		]);
		const skills = state.cards({ type: 'skill' });
		expect(skills).toContain(skillCard);
		expect(skills).not.toContain(itemCard);
	});

	it('includes cards attached to locations', () => {
		const attached = mock<ReadonlyCardState>({ attachments: [] });
		const location = mock<ReadonlyLocationStateType>({ attachments: [attached] });
		const state = makeGameState([mock<ReadonlyPlayerState>({ cards: () => [] })], [location]);
		expect(state.cards()).toContain(attached);
	});

	it('includes cards attached to player cards', () => {
		const attached = mock<ReadonlyCardState>({ attachments: [] });
		const playerCard = mock<ReadonlyCardState>({ attachments: [attached] });
		const state = makeGameState([mock<ReadonlyPlayerState>({ cards: () => [playerCard] })]);
		expect(state.cards()).toContain(attached);
	});

	it('with ready:true skips exhausted player cards', () => {
		const readyCard = mock<ReadonlyCardState>({ attachments: [], exhausted: false });
		const exhaustedCard = mock<ReadonlyCardState>({ attachments: [], exhausted: true });
		const state = makeGameState([
			mock<ReadonlyPlayerState>({ cards: () => [readyCard, exhaustedCard] })
		]);
		const ready = state.cards({ ready: true });
		expect(ready).toContain(readyCard);
		expect(ready).not.toContain(exhaustedCard);
	});

	it('filters locations by entity type', () => {
		const matchingLoc = mock<ReadonlyLocationStateType>({
			attachments: [],
			card: { type: { id: 'location' } } as Entity
		});
		const otherLoc = mock<ReadonlyLocationStateType>({
			attachments: [],
			card: { type: { id: 'creature' } } as Entity
		});
		const state = makeGameState(
			[mock<ReadonlyPlayerState>({ cards: () => [] })],
			[matchingLoc, otherLoc]
		);
		const locations = state.cards({ type: 'location' });
		expect(locations).toContain(matchingLoc);
		expect(locations).not.toContain(otherLoc);
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
			properties: [],
			coordinates: { x: 0, y: 0 }
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

// ─── GameState getters from capabilityResolutionStack ─────────────────────────

function makeResolution(
	cardId: CardId,
	opts?: { reaction?: boolean; cardMock?: ReadonlyCardState }
): CapabilityResolution {
	const capability = opts?.reaction
		? new Opportunity({ id: 'test', effects: [], triggers: ['turnStart'] })
		: new Action({ id: 'test', effects: [] });
	return new ReadonlyCapabilityResolution({
		subjectId: cardId,
		cardId,
		capability
	});
}

describe('GameState capability resolution stack getters', () => {
	describe('getActiveCard / requireActiveCard', () => {
		it('getActiveCard returns undefined when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(state.getActiveCard()).toBeUndefined();
		});

		it('requireActiveCard throws when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(() => state.requireActiveCard()).toThrow();
		});

		it('getActiveCard returns the card of the top non-Reaction resolution', () => {
			const c1 = mock<ReadonlyCardState>();
			const c2 = mock<ReadonlyCardState>();
			const p1 = mock<ReadonlyPlayerState>({
				getCard: (id: string) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
			});
			const r1 = makeResolution('trt1');
			const r2 = makeResolution('trt2');
			const state = new ReadonlyGameState({
				players: [p1],
				capabilityResolutionStack: [r1, r2]
			});
			expect(state.getActiveCard()).toBe(c2);
		});

		it('getActiveCard skips Reaction resolutions', () => {
			const c1 = mock<ReadonlyCardState>();
			const c2 = mock<ReadonlyCardState>();
			const p1 = mock<ReadonlyPlayerState>({
				getCard: (id: string) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
			});
			const reactionRes = makeResolution('trt1', { reaction: true });
			const actionRes = makeResolution('trt2');
			const state = new ReadonlyGameState({
				players: [p1],
				capabilityResolutionStack: [actionRes, reactionRes]
			});
			expect(state.getActiveCard()).toBe(c2);
		});
	});

	describe('getActivePlayer / requireActivePlayer', () => {
		it('getActivePlayer returns undefined when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(state.getActivePlayer()).toBeUndefined();
		});

		it('requireActivePlayer throws when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(() => state.requireActivePlayer()).toThrow();
		});

		it('getActivePlayer returns the player from subjectStack when no active card', () => {
			const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
			const state = new ReadonlyGameState({
				players: [p1],
				subjectStack: ['plr1']
			});
			expect(state.getActivePlayer()).toBe(p1);
		});
	});

	describe('getReactiveCard / requireReactiveCard', () => {
		it('getReactiveCard returns undefined when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(state.getReactiveCard()).toBeUndefined();
		});

		it('requireReactiveCard throws when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(() => state.requireReactiveCard()).toThrow();
		});

		it('getReactiveCard returns the card of the top Reaction resolution', () => {
			const c1 = mock<ReadonlyCardState>();
			const c2 = mock<ReadonlyCardState>();
			const p1 = mock<ReadonlyPlayerState>({
				getCard: (id: string) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
			});
			const actionRes = makeResolution('trt1');
			const reactionRes = makeResolution('trt2', { reaction: true });
			const state = new ReadonlyGameState({
				players: [p1],
				capabilityResolutionStack: [actionRes, reactionRes]
			});
			expect(state.getReactiveCard()).toBe(c2);
		});

		it('getReactiveCard returns undefined when only non-Reaction resolutions exist', () => {
			const c1 = mock<ReadonlyCardState>();
			const p1 = mock<ReadonlyPlayerState>({
				getCard: (id: string) => (id === 'trt1' ? c1 : undefined)
			});
			const r = makeResolution('trt1');
			const state = new ReadonlyGameState({
				players: [p1],
				capabilityResolutionStack: [r]
			});
			expect(state.getReactiveCard()).toBeUndefined();
		});
	});

	describe('getReactivePlayer / requireReactivePlayer', () => {
		it('getReactivePlayer returns undefined when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(state.getReactivePlayer()).toBeUndefined();
		});

		it('requireReactivePlayer throws when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(() => state.requireReactivePlayer()).toThrow();
		});
	});

	describe('getCurrentCard / requireCurrentCard', () => {
		it('getCurrentCard returns undefined when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(state.getCurrentCard()).toBeUndefined();
		});

		it('requireCurrentCard throws when the stack is empty', () => {
			const state = makeGameState([mock<ReadonlyPlayerState>()]);
			expect(() => state.requireCurrentCard()).toThrow();
		});

		it('getCurrentCard returns the card of the top resolution', () => {
			const c1 = mock<ReadonlyCardState>();
			const c2 = mock<ReadonlyCardState>();
			const p1 = mock<ReadonlyPlayerState>({
				getCard: (id: string) => (id === 'trt1' ? c1 : id === 'trt2' ? c2 : undefined)
			});
			const r1 = makeResolution('trt1');
			const r2 = makeResolution('trt2');
			const state = new ReadonlyGameState({
				players: [p1],
				capabilityResolutionStack: [r1, r2]
			});
			expect(state.getCurrentCard()).toBe(c2);
		});
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

// ─── GameState.evaluateBoolean / evaluateScalar ──────────────────────────────

describe('GameState.evaluateBoolean', () => {
	it('returns a boolean literal unchanged', () => {
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluateBoolean(true)).toBe(true);
		expect(state.evaluateBoolean(false)).toBe(false);
	});

	it('delegates to a BooleanExpression via extension method', () => {
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluateBoolean(not(true))).toBe(false);
		expect(state.evaluateBoolean(not(false))).toBe(true);
	});
});

describe('GameState.evaluateScalar', () => {
	it('returns a number literal unchanged', () => {
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluateScalar(7)).toBe(7);
	});

	it('returns the active player stat value for a Stat', () => {
		const player = mock<ReadonlyPlayerState>({
			id: 'plr1',
			getStat: (stat) => (stat === strength ? 4 : 0)
		});
		const state = new ReadonlyGameState({ players: [player], subjectStack: ['plr1'] });
		expect(state.evaluateScalar(strength)).toBe(4);
	});

	it('delegates to a ScalarExpression via extension method', () => {
		const state = new ReadonlyGameState({ players: [] });
		expect(state.evaluateScalar(plus(3, 4))).toBe(7);
	});
});

// ─── GameState.getConcentration ──────────────────────────────────────────────

describe('GameState.getConcentration', () => {
	it('returns 1 when the player has no cards', () => {
		const player = mock<ReadonlyPlayerState>({ id: 'plr1', hand: [], attachments: [] });
		const state = new ReadonlyGameState({ players: [player] });

		expect(state.getConcentration('plr1')).toBe(1);
	});

	it('adds modifier from a Constant capability in hand', () => {
		const cap = new Constant({ id: 'test', effects: [modifyConcentration(2)] });
		const entity = mock<Entity>({ capabilities: [cap], attachmentCapabilities: [] });
		const card = mock<ReadonlyCardState>({ card: entity, attachments: [] });
		const player = mock<ReadonlyPlayerState>({
			id: 'plr1',
			hand: [card],
			attachments: []
		});
		const state = new ReadonlyGameState({ players: [player] });

		expect(state.getConcentration('plr1')).toBe(3);
	});

	it('adds modifier from a Constant capability on an attached card', () => {
		const cap = new Constant({ id: 'test', effects: [modifyConcentration(1)] });
		const entity = mock<Entity>({ capabilities: [cap], attachmentCapabilities: [] });
		const attachedCard = mock<ReadonlyCardState>({ card: entity, attachments: [] });
		const player = mock<ReadonlyPlayerState>({
			id: 'plr1',
			hand: [],
			attachments: [attachedCard]
		});
		const state = new ReadonlyGameState({ players: [player] });

		expect(state.getConcentration('plr1')).toBe(2);
	});

	it('sums modifiers from multiple cards', () => {
		const cap1 = new Constant({ id: 'test1', effects: [modifyConcentration(1)] });
		const cap2 = new Constant({ id: 'test2', effects: [modifyConcentration(2)] });
		const e1 = mock<Entity>({ capabilities: [cap1], attachmentCapabilities: [] });
		const e2 = mock<Entity>({ capabilities: [cap2], attachmentCapabilities: [] });
		const c1 = mock<ReadonlyCardState>({ card: e1, attachments: [] });
		const c2 = mock<ReadonlyCardState>({ card: e2, attachments: [] });
		const player = mock<ReadonlyPlayerState>({ id: 'plr1', hand: [c1, c2], attachments: [] });
		const state = new ReadonlyGameState({ players: [player] });

		expect(state.getConcentration('plr1')).toBe(4);
	});

	it('is clamped to a minimum of 0', () => {
		const cap = new Constant({ id: 'test', effects: [modifyConcentration(-5)] });
		const entity = mock<Entity>({ capabilities: [cap], attachmentCapabilities: [] });
		const card = mock<ReadonlyCardState>({ card: entity, attachments: [] });
		const player = mock<ReadonlyPlayerState>({ id: 'plr1', hand: [card], attachments: [] });
		const state = new ReadonlyGameState({ players: [player] });

		expect(state.getConcentration('plr1')).toBe(0);
	});

	it('ignores non-Constant capabilities', () => {
		const action = new Action({ id: 'test', effects: [modifyConcentration(10)] });
		const entity = mock<Entity>({ capabilities: [action], attachmentCapabilities: [] });
		const card = mock<ReadonlyCardState>({ card: entity, attachments: [] });
		const player = mock<ReadonlyPlayerState>({ id: 'plr1', hand: [card], attachments: [] });
		const state = new ReadonlyGameState({ players: [player] });

		// Action.constantEffects() returns [] so the modifier should be ignored
		expect(state.getConcentration('plr1')).toBe(1);
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

		it('copies the capability resolution stack', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const resolution = makeResolution('trt1');
			const state = new ReadonlyGameState({
				players: [p1],
				capabilityResolutionStack: [resolution]
			});
			const mutable = state.mutable();
			expect(mutable.capabilityResolutionStack).toHaveLength(1);
		});

		it('copies the subject stack', () => {
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
				m.subjectStack.push('plr1');
			});
			expect(updated).toBeInstanceOf(ReadonlyGameState);
			expect(updated.subjectStack).toContain('plr1');
		});

		it('does not mutate the original', () => {
			const p1 = mock<ReadonlyPlayerState>();
			p1.mutable.mockReturnValue({
				id: 'plr1',
				readonly: () => p1
			} as unknown as MutablePlayerState);
			const state = makeGameState([p1]);
			state.mutate((m) => {
				m.subjectStack.push('plr1');
			});
			expect(state.subjectStack).toEqual([]);
		});
	});
});

// ─── MutableGameState.pushContext / popContext ────────────────────────────────

function makeMutableState(overrides?: {
	capabilityResolutionStack?: Array<CapabilityResolution>;
	subjectStack?: EntityId[];
	targetStack?: EntityId[];
}): ReturnType<ReadonlyGameState['mutable']> {
	const p1 = mock<ReadonlyPlayerState>();
	p1.mutable.mockReturnValue({ id: 'plr1', readonly: () => p1 } as unknown as MutablePlayerState);
	return new ReadonlyGameState({ players: [p1], ...overrides }).mutable();
}

describe('MutableGameState.pushContext', () => {
	it('pushes capabilityResolution onto capabilityResolutionStack', () => {
		const state = makeMutableState();
		const resolution = new MutableCapabilityResolution({
			subjectId: 'trt1',
			cardId: 'trt1',
			capability: new Action({ id: 'test', effects: [] })
		});
		state.pushContext({ capabilityResolution: resolution });
		expect(state.capabilityResolutionStack).toEqual([resolution]);
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
		const resolution = new MutableCapabilityResolution({
			subjectId: 'trt1',
			cardId: 'trt1',
			capability: new Action({ id: 'test', effects: [] })
		});
		state.pushContext({
			capabilityResolution: resolution,
			subjectId: 'plr1',
			targetId: 'trt1'
		});
		expect(state.capabilityResolutionStack).toEqual([resolution]);
		expect(state.subjectStack).toEqual(['plr1']);
		expect(state.targetStack).toEqual(['trt1']);
	});

	it('does not touch stacks for undefined fields', () => {
		const state = makeMutableState({ subjectStack: ['plr9'] });
		state.pushContext({ targetId: 'trt1' });
		expect(state.subjectStack).toEqual(['plr9']);
		expect(state.targetStack).toEqual(['trt1']);
	});

	it('pushes onto existing stack entries', () => {
		const state = makeMutableState({ subjectStack: ['plr1'] });
		state.pushContext({ subjectId: 'plr2' });
		expect(state.subjectStack).toEqual(['plr1', 'plr2']);
	});
});

describe('MutableGameState.popContext', () => {
	it('pops targetId from targetStack', () => {
		const state = makeMutableState({ targetStack: ['trt1'] });
		state.popContext({ targetId: 'trt1' });
		expect(state.targetStack).toEqual([]);
	});

	it('pops subjectId from subjectStack', () => {
		const state = makeMutableState({ subjectStack: ['plr1'] });
		state.popContext({ subjectId: 'plr1' });
		expect(state.subjectStack).toEqual([]);
	});

	it('pops capabilityResolution from capabilityResolutionStack', () => {
		const resolution = new MutableCapabilityResolution({
			subjectId: 'trt1',
			cardId: 'trt1',
			capability: new Action({ id: 'test', effects: [] })
		});
		const state = makeMutableState({ capabilityResolutionStack: [resolution] });
		state.popContext({ capabilityResolution: resolution });
		expect(state.capabilityResolutionStack).toEqual([]);
	});

	it('pops all provided fields in reverse order', () => {
		const resolution = new MutableCapabilityResolution({
			subjectId: 'trt1',
			cardId: 'trt1',
			capability: new Action({ id: 'test', effects: [] })
		});
		const state = makeMutableState({
			capabilityResolutionStack: [resolution],
			subjectStack: ['plr1'],
			targetStack: ['trt1']
		});
		state.popContext({
			capabilityResolution: resolution,
			subjectId: 'plr1',
			targetId: 'trt1'
		});
		expect(state.capabilityResolutionStack).toEqual([]);
		expect(state.subjectStack).toEqual([]);
		expect(state.targetStack).toEqual([]);
	});

	it('does not touch stacks for undefined fields', () => {
		const state = makeMutableState({ subjectStack: ['plr9'], targetStack: ['trt1'] });
		state.popContext({ targetId: 'trt1' });
		expect(state.subjectStack).toEqual(['plr9']);
		expect(state.targetStack).toEqual([]);
	});

	it('only pops the top entry, leaving preceding entries intact', () => {
		const state = makeMutableState({ subjectStack: ['plr1', 'plr2'] });
		state.popContext({ subjectId: 'plr2' });
		expect(state.subjectStack).toEqual(['plr1']);
	});
});

describe('MutableGameState pushContext / popContext round-trip', () => {
	it('restores all stacks to their original state', () => {
		const resolution = new MutableCapabilityResolution({
			subjectId: 'trt1',
			cardId: 'trt1',
			capability: new Action({ id: 'test', effects: [] })
		});
		const ctx: GameContext = {
			capabilityResolution: resolution,
			subjectId: 'plr1',
			targetId: 'trt1'
		};
		const state = makeMutableState();
		state.pushContext(ctx);
		state.popContext(ctx);
		expect(state.capabilityResolutionStack).toEqual([]);
		expect(state.subjectStack).toEqual([]);
		expect(state.targetStack).toEqual([]);
	});

	it('preserves pre-existing entries after a push/pop cycle', () => {
		const state = makeMutableState({
			subjectStack: ['plr9'],
			targetStack: ['trt9']
		});
		const ctx: GameContext = { subjectId: 'plr1', targetId: 'trt1' };
		state.pushContext(ctx);
		state.popContext(ctx);
		expect(state.subjectStack).toEqual(['plr9']);
		expect(state.targetStack).toEqual(['trt9']);
	});
});

// ─── GameState.getEntityLocation ─────────────────────────────────────────────

describe('GameState.getEntityLocation', () => {
	it('returns the location containing the player when given a PlayerId', () => {
		const loc1 = makeLocation('loc1', ['plr1']);
		const loc2 = makeLocation('loc2');
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })], [loc1, loc2]);

		expect(state.getEntityLocation('plr1')).toBe(loc1);
	});

	it('returns the location containing the player when given a player object', () => {
		const loc1 = makeLocation('loc1', ['plr1']);
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const state = makeGameState([p1], [loc1]);

		expect(state.getEntityLocation(p1)).toBe(loc1);
	});

	it('returns undefined when the player is not in any location', () => {
		const loc1 = makeLocation('loc1');
		const state = makeGameState([mock<ReadonlyPlayerState>({ id: 'plr1' })], [loc1]);

		expect(state.getEntityLocation('plr1')).toBeUndefined();
	});
});

// ─── MutableGameState.setPlayerLocation ──────────────────────────────────────

describe('MutableGameState.setPlayerLocation', () => {
	it('adds the player to the destination when not in any location', () => {
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer('plr1')],
			locations: [makeLocation('loc1')]
		}).mutable();

		state.setActorLocation('plr1', 'loc1');

		expect(state.locations[0].players).toContain('plr1');
	});

	it('removes the player from the origin and adds them to the destination', () => {
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer('plr1')],
			locations: [makeLocation('loc1', ['plr1']), makeLocation('loc2')]
		}).mutable();

		state.setActorLocation('plr1', 'loc2');

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

		state.setActorLocation(player, destination);

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

// ─── GameState.scenario / nextScenario ─────────────────────────────────────

function makeScenario(title = 'test-scenario'): Scenario {
	return mock<Scenario>({ id: title, title: { ca: title, es: title, en: title } });
}

describe('GameState.scenario', () => {
	it('defaults to undefined when not provided', () => {
		const state = makeGameState([]);
		expect(state.scenario).toBeUndefined();
	});

	it('stores the provided scenario', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({ players: [], scenario: sc });
		expect(state.scenario).toBe(sc);
	});

	it('is preserved through mutable() round-trip', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			scenario: sc
		});
		expect(state.mutable().scenario).toBe(sc);
	});

	it('is preserved through mutate()', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			scenario: sc
		});
		const updated = state.mutate((m) => {
			m.subjectStack.push('plr1');
		});
		expect(updated.scenario).toBe(sc);
	});

	it('is settable on MutableGameState', () => {
		const sc1 = makeScenario('sc1');
		const sc2 = makeScenario('sc2');
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			scenario: sc1
		});
		const mutable = state.mutable();
		mutable.scenario = sc2;
		expect(mutable.scenario).toBe(sc2);
	});

	it('is preserved through mutable().readonly() round-trip', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			scenario: sc
		});
		const roundTripped = state.mutable().readonly();
		expect(roundTripped.scenario).toBe(sc);
	});

	it('is preserved when set on mutable and then readonly()', () => {
		const sc1 = makeScenario('sc1');
		const sc2 = makeScenario('sc2');
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			scenario: sc1
		});
		const mutable = state.mutable();
		mutable.scenario = sc2;
		const roundTripped = mutable.readonly();
		expect(roundTripped.scenario).toBe(sc2);
	});
});

describe('GameState.nextScenario', () => {
	it('defaults to undefined when not provided', () => {
		const state = makeGameState([]);
		expect(state.nextScenario).toBeUndefined();
	});

	it('stores the provided nextScenario', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({ players: [], nextScenario: sc });
		expect(state.nextScenario).toBe(sc);
	});

	it('is preserved through mutable() round-trip', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			nextScenario: sc
		});
		expect(state.mutable().nextScenario).toBe(sc);
	});

	it('is preserved through mutate()', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			nextScenario: sc
		});
		const updated = state.mutate((m) => {
			m.subjectStack.push('plr1');
		});
		expect(updated.nextScenario).toBe(sc);
	});

	it('is settable on MutableGameState', () => {
		const sc1 = makeScenario('sc1');
		const sc2 = makeScenario('sc2');
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			nextScenario: sc1
		});
		const mutable = state.mutable();
		mutable.nextScenario = sc2;
		expect(mutable.nextScenario).toBe(sc2);
	});

	it('is preserved through mutable().readonly() round-trip', () => {
		const sc = makeScenario();
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			nextScenario: sc
		});
		const roundTripped = state.mutable().readonly();
		expect(roundTripped.nextScenario).toBe(sc);
	});

	it('is preserved when set on mutable and then readonly()', () => {
		const sc1 = makeScenario('sc1');
		const sc2 = makeScenario('sc2');
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			nextScenario: sc1
		});
		const mutable = state.mutable();
		mutable.nextScenario = sc2;
		const roundTripped = mutable.readonly();
		expect(roundTripped.nextScenario).toBe(sc2);
	});

	it('scenario and nextScenario are independent', () => {
		const sc1 = makeScenario('sc1');
		const sc2 = makeScenario('sc2');
		const state = new ReadonlyGameState({
			players: [makeMutablePlayer()],
			scenario: sc1,
			nextScenario: sc2
		});
		expect(state.scenario).toBe(sc1);
		expect(state.nextScenario).toBe(sc2);
	});
});
