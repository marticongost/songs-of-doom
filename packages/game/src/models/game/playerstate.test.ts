import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { CharacterState } from '../characters';
import type { Entity } from '../entities';
import { MutableCardState, ReadonlyCardState } from './cardstate';
import type { MutableGameState } from './gamestate';
import type { PlayerId } from './identifiers';
import { ReadonlyPlayerState } from './playerstate';

function makePlayer(
	id: PlayerId,
	cards: {
		deck?: ReadonlyCardState[];
		hand?: ReadonlyCardState[];
		discard?: ReadonlyCardState[];
		attachments?: ReadonlyCardState[];
	} = {}
): ReadonlyPlayerState {
	return new ReadonlyPlayerState({
		id,
		character: mock<CharacterState>(),
		deck: cards.deck ?? [],
		hand: cards.hand ?? [],
		discardPile: cards.discard ?? [],
		attachments: cards.attachments ?? [],
		focusesBag: new Map(),
		focusesHand: new Map(),
		physicalTrauma: 0,
		mentalTrauma: 0
	});
}

// ─── PlayerState.cards ────────────────────────────────────────────────────────

describe('PlayerState.cards', () => {
	it('returns all cards from deck, hand, discard and attachments', () => {
		const inDeck = mock<ReadonlyCardState>();
		const inHand = mock<ReadonlyCardState>();
		const inDiscard = mock<ReadonlyCardState>();
		const attached = mock<ReadonlyCardState>();
		const player = makePlayer('p1', {
			deck: [inDeck],
			hand: [inHand],
			discard: [inDiscard],
			attachments: [attached]
		});
		const all = player.cards();
		expect(all).toContain(inDeck);
		expect(all).toContain(inHand);
		expect(all).toContain(inDiscard);
		expect(all).toContain(attached);
	});

	it('with ready:true returns only non-exhausted hand and attachment cards', () => {
		const readyHand = mock<ReadonlyCardState>({ exhausted: false });
		const exhaustedHand = mock<ReadonlyCardState>({ exhausted: true });
		const readyAttachment = mock<ReadonlyCardState>({ exhausted: false });
		const exhaustedAttachment = mock<ReadonlyCardState>({ exhausted: true });
		const deckCard = mock<ReadonlyCardState>();
		const player = makePlayer('p1', {
			deck: [deckCard],
			hand: [readyHand, exhaustedHand],
			attachments: [readyAttachment, exhaustedAttachment]
		});
		const ready = player.cards({ ready: true });
		expect(ready).toContain(readyHand);
		expect(ready).toContain(readyAttachment);
		expect(ready).not.toContain(exhaustedHand);
		expect(ready).not.toContain(exhaustedAttachment);
		expect(ready).not.toContain(deckCard);
	});
});

// ─── PlayerState.getCard ──────────────────────────────────────────────────────

describe('PlayerState.getCard', () => {
	it('finds a card in hand', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { hand: [c1] });
		expect(player.getCard('c1')).toBe(c1);
	});

	it('finds a card in deck', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { deck: [c1] });
		expect(player.getCard('c1')).toBe(c1);
	});

	it('finds a card in the discard pile', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { discard: [c1] });
		expect(player.getCard('c1')).toBe(c1);
	});

	it('finds a card in attachments', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { attachments: [c1] });
		expect(player.getCard('c1')).toBe(c1);
	});

	it('finds a nested attachment on a hand card', () => {
		const nested = mock<ReadonlyCardState>();
		const parent = mock<ReadonlyCardState>();
		parent.getCard.mockImplementation((id) =>
			id === 'c2' ? nested : id === 'c1' ? parent : undefined
		);
		const player = makePlayer('p1', { hand: [parent] });
		expect(player.getCard('c2')).toBe(nested);
	});

	it('returns undefined for an unknown id', () => {
		const player = makePlayer('p1');
		expect(player.getCard('c99')).toBeUndefined();
	});
});

// ─── PlayerState.requireCard ──────────────────────────────────────────────────

describe('PlayerState.requireCard', () => {
	it('finds a card in hand', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { hand: [c1] });
		expect(player.requireCard('c1')).toBe(c1);
	});

	it('finds a card in deck', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { deck: [c1] });
		expect(player.requireCard('c1')).toBe(c1);
	});

	it('finds a card in the discard pile', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { discard: [c1] });
		expect(player.requireCard('c1')).toBe(c1);
	});

	it('finds a card in attachments', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
		const player = makePlayer('p1', { attachments: [c1] });
		expect(player.requireCard('c1')).toBe(c1);
	});

	it('finds a nested attachment on a hand card', () => {
		const nested = mock<ReadonlyCardState>();
		const parent = mock<ReadonlyCardState>();
		parent.getCard.mockImplementation((id) =>
			id === 'c2' ? nested : id === 'c1' ? parent : undefined
		);
		const player = makePlayer('p1', { hand: [parent] });
		expect(player.requireCard('c2')).toBe(nested);
	});

	it('throws when the card does not exist', () => {
		const player = makePlayer('p1');
		expect(() => player.requireCard('c99')).toThrow('c99');
	});
});

// ─── ReadonlyPlayerState.mutable / mutate ─────────────────────────────────────

describe('ReadonlyPlayerState', () => {
	describe('mutable', () => {
		it('produces a mutable copy with the same id', () => {
			const player = makePlayer('p1');
			const mutable = player.mutable();
			expect(mutable.id).toBe('p1');
		});

		it('converts hand cards to MutableCardState', () => {
			const c1 = new ReadonlyCardState({
				id: 'c1',
				card: mock<Entity>(),
				ownerId: 'p1',
				location: { container: 'hand', playerId: 'p1' },
				properties: []
			});
			const player = makePlayer('p1', { hand: [c1] });
			const mutable = player.mutable();
			expect(mutable.hand[0]).toBeInstanceOf(MutableCardState);
		});

		it('copies trauma values', () => {
			const player = new ReadonlyPlayerState({
				id: 'p1',
				character: mock<CharacterState>(),
				deck: [],
				hand: [],
				discardPile: [],
				attachments: [],
				focusesBag: new Map(),
				focusesHand: new Map(),
				physicalTrauma: 3,
				mentalTrauma: 2
			});
			const mutable = player.mutable();
			expect(mutable.physicalTrauma).toBe(3);
			expect(mutable.mentalTrauma).toBe(2);
		});
	});

	describe('mutate', () => {
		it('applies the change and returns a new ReadonlyPlayerState', () => {
			const player = makePlayer('p1');
			const updated = player.mutate((m) => {
				m.physicalTrauma = 5;
			});
			expect(updated).toBeInstanceOf(ReadonlyPlayerState);
			expect(updated.physicalTrauma).toBe(5);
		});

		it('does not mutate the original', () => {
			const player = makePlayer('p1');
			player.mutate((m) => {
				m.mentalTrauma = 99;
			});
			expect(player.mentalTrauma).toBe(0);
		});
	});
});

// ─── MutablePlayerState.drawFromDeck ─────────────────────────────────────────

describe('MutablePlayerState.drawFromDeck', () => {
	it('moves the top deck card to hand', () => {
		const c1 = new ReadonlyCardState({
			id: 'c1',
			card: mock<Entity>(),
			ownerId: 'p1',
			location: { container: 'deck', playerId: 'p1' },
			properties: []
		});
		const c2 = new ReadonlyCardState({
			id: 'c2',
			card: mock<Entity>(),
			ownerId: 'p1',
			location: { container: 'deck', playerId: 'p1' },
			properties: []
		});
		const mutablePlayer = makePlayer('p1', { deck: [c1, c2] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 1);

		expect(drawn).toMatchObject([{ id: 'c1', location: { container: 'hand', playerId: 'p1' } }]);
		expect(mutablePlayer.hand).toContain(drawn[0]);
		expect(mutablePlayer.deck).not.toContain(drawn[0]);
	});

	it('draws multiple cards in order', () => {
		const c1 = new ReadonlyCardState({
			id: 'c1',
			card: mock<Entity>(),
			ownerId: 'p1',
			location: { container: 'deck', playerId: 'p1' },
			properties: []
		});
		const c2 = new ReadonlyCardState({
			id: 'c2',
			card: mock<Entity>(),
			ownerId: 'p1',
			location: { container: 'deck', playerId: 'p1' },
			properties: []
		});
		const mutablePlayer = makePlayer('p1', { deck: [c1, c2] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 2);

		expect(drawn).toMatchObject([
			{ id: 'c1', location: { container: 'hand', playerId: 'p1' } },
			{ id: 'c2', location: { container: 'hand', playerId: 'p1' } }
		]);
		expect(mutablePlayer.hand).toEqual(drawn);
		expect(mutablePlayer.deck).toEqual([]);
	});

	it('shuffles the discard pile into the deck when the deck is empty', () => {
		const c1 = new ReadonlyCardState({
			id: 'c1',
			card: mock<Entity>(),
			ownerId: 'p1',
			location: { container: 'discard', playerId: 'p1' },
			properties: []
		});
		const mutablePlayer = makePlayer('p1', { discard: [c1] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 1);

		expect(drawn).toMatchObject([{ id: 'c1', location: { container: 'hand', playerId: 'p1' } }]);
		expect(mutablePlayer.hand).toEqual(drawn);
	});

	it('draws nothing when both deck and discard are empty', () => {
		const mutablePlayer = makePlayer('p1').mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 1);

		expect(drawn).toEqual([]);
		expect(mutablePlayer.hand).toEqual([]);
	});

	it('defaults to drawing 1 card', () => {
		const c1 = new ReadonlyCardState({
			id: 'c1',
			card: mock<Entity>(),
			ownerId: 'p1',
			location: { container: 'deck', playerId: 'p1' },
			properties: []
		});
		const mutablePlayer = makePlayer('p1', { deck: [c1] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState);

		expect(drawn).toMatchObject([{ id: 'c1', location: { container: 'hand', playerId: 'p1' } }]);
	});
});

// ─── MutablePlayerState.addAttachment ────────────────────────────────────────

describe('MutablePlayerState.addAttachment', () => {
	it('moves a card from hand to player attachments', () => {
		const c1 = new ReadonlyCardState({
			id: 'c1',
			card: mock<Entity>(),
			ownerId: 'p1',
			location: { container: 'hand', playerId: 'p1' },
			properties: []
		});
		const mutablePlayer = makePlayer('p1', { hand: [c1] }).mutable();
		const mutableCard = mutablePlayer.requireCard('c1');
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		mutablePlayer.addAttachment(gameState, mutableCard);

		expect(mutableCard.location).toEqual({ container: 'player', playerId: 'p1' });
		expect(mutablePlayer.attachments).toContain(mutableCard);
		expect(mutablePlayer.hand).not.toContain(mutableCard);
	});
});
