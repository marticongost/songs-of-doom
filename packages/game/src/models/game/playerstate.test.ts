import { Counter } from '@songsofdoom/common';
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
		stage?: ReadonlyCardState[];
		discard?: ReadonlyCardState[];
		attachments?: ReadonlyCardState[];
		banished?: ReadonlyCardState[];
	} = {}
): ReadonlyPlayerState {
	return new ReadonlyPlayerState({
		id,
		character: mock<CharacterState>(),
		deck: cards.deck ?? [],
		hand: cards.hand ?? [],
		stage: cards.stage ?? [],
		discardPile: cards.discard ?? [],
		banishedCards: cards.banished ?? [],
		attachments: cards.attachments ?? [],
		focusesBag: new Counter(),
		focusesDiscardPile: new Counter(),
		focusesHand: new Counter(),
		physicalTrauma: 0,
		mentalTrauma: 0
	});
}

// ─── PlayerState.cards ────────────────────────────────────────────────────────

describe('PlayerState.cards', () => {
	it('returns all cards from deck, hand, stage, discard and attachments', () => {
		const inDeck = mock<ReadonlyCardState>();
		const inHand = mock<ReadonlyCardState>();
		const inStage = mock<ReadonlyCardState>();
		const inDiscard = mock<ReadonlyCardState>();
		const attached = mock<ReadonlyCardState>();
		const player = makePlayer('plr1', {
			deck: [inDeck],
			hand: [inHand],
			stage: [inStage],
			discard: [inDiscard],
			attachments: [attached]
		});
		const all = player.cards();
		expect(all).toContain(inDeck);
		expect(all).toContain(inHand);
		expect(all).toContain(inStage);
		expect(all).toContain(inDiscard);
		expect(all).toContain(attached);
	});

	it('returns banished cards', () => {
		const banished = mock<ReadonlyCardState>();
		const player = makePlayer('plr1', { banished: [banished] });
		expect(player.cards()).toContain(banished);
	});

	it('with ready:true returns only non-exhausted hand, stage and attachment cards', () => {
		const readyHand = mock<ReadonlyCardState>({ exhausted: false });
		const exhaustedHand = mock<ReadonlyCardState>({ exhausted: true });
		const readyStage = mock<ReadonlyCardState>({ exhausted: false });
		const exhaustedStage = mock<ReadonlyCardState>({ exhausted: true });
		const readyAttachment = mock<ReadonlyCardState>({ exhausted: false });
		const exhaustedAttachment = mock<ReadonlyCardState>({ exhausted: true });
		const deckCard = mock<ReadonlyCardState>();
		const player = makePlayer('plr1', {
			deck: [deckCard],
			hand: [readyHand, exhaustedHand],
			stage: [readyStage, exhaustedStage],
			attachments: [readyAttachment, exhaustedAttachment]
		});
		const ready = player.cards({ ready: true });
		expect(ready).toContain(readyHand);
		expect(ready).toContain(readyStage);
		expect(ready).toContain(readyAttachment);
		expect(ready).not.toContain(exhaustedHand);
		expect(ready).not.toContain(exhaustedStage);
		expect(ready).not.toContain(exhaustedAttachment);
		expect(ready).not.toContain(deckCard);
	});
});

// ─── PlayerState.getCard ──────────────────────────────────────────────────────

describe('PlayerState.getCard', () => {
	it('finds a card in hand', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { hand: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in deck', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { deck: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in the discard pile', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { discard: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in attachments', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { attachments: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in banished cards', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { banished: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a nested attachment on a hand card', () => {
		const nested = mock<ReadonlyCardState>();
		const parent = mock<ReadonlyCardState>();
		parent.getCard.mockImplementation((id) =>
			id === 'trt2' ? nested : id === 'trt1' ? parent : undefined
		);
		const player = makePlayer('plr1', { hand: [parent] });
		expect(player.getCard('trt2')).toBe(nested);
	});

	it('returns undefined for an unknown id', () => {
		const player = makePlayer('plr1');
		expect(player.getCard('trt99')).toBeUndefined();
	});
});

// ─── PlayerState.requireCard ──────────────────────────────────────────────────

describe('PlayerState.requireCard', () => {
	it('finds a card in hand', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { hand: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in deck', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { deck: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in the discard pile', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { discard: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in attachments', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { attachments: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in banished cards', () => {
		const c1 = mock<ReadonlyCardState>();
		c1.getCard.mockImplementation((id) => (id === 'trt1' ? c1 : undefined));
		const player = makePlayer('plr1', { banished: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a nested attachment on a hand card', () => {
		const nested = mock<ReadonlyCardState>();
		const parent = mock<ReadonlyCardState>();
		parent.getCard.mockImplementation((id) =>
			id === 'trt2' ? nested : id === 'trt1' ? parent : undefined
		);
		const player = makePlayer('plr1', { hand: [parent] });
		expect(player.requireCard('trt2')).toBe(nested);
	});

	it('throws when the card does not exist', () => {
		const player = makePlayer('plr1');
		expect(() => player.requireCard('trt99')).toThrow('trt99');
	});
});

// ─── ReadonlyPlayerState.mutable / mutate ─────────────────────────────────────

describe('ReadonlyPlayerState', () => {
	describe('mutable', () => {
		it('produces a mutable copy with the same id', () => {
			const player = makePlayer('plr1');
			const mutable = player.mutable();
			expect(mutable.id).toBe('plr1');
		});

		it('converts hand cards to MutableCardState', () => {
			const c1 = new ReadonlyCardState({
				id: 'trt1',
				card: mock<Entity>(),
				ownerId: 'plr1',
				container: { type: 'hand', playerId: 'plr1' },
				properties: []
			});
			const player = makePlayer('plr1', { hand: [c1] });
			const mutable = player.mutable();
			expect(mutable.hand[0]).toBeInstanceOf(MutableCardState);
		});

		it('converts banished cards to MutableCardState', () => {
			const c1 = new ReadonlyCardState({
				id: 'trt1',
				card: mock<Entity>(),
				ownerId: 'plr1',
				container: { type: 'banish', playerId: 'plr1' },
				properties: []
			});
			const player = makePlayer('plr1', { banished: [c1] });
			const mutable = player.mutable();
			expect(mutable.banishedCards[0]).toBeInstanceOf(MutableCardState);
		});

		it('copies trauma values', () => {
			const player = new ReadonlyPlayerState({
				id: 'plr1',
				character: mock<CharacterState>(),
				deck: [],
				hand: [],
				discardPile: [],
				attachments: [],
				focusesBag: new Counter(),
				focusesDiscardPile: new Counter(),
				focusesHand: new Counter(),
				physicalTrauma: 3,
				mentalTrauma: 2
			});
			const mutable = player.mutable();
			expect(mutable.physicalTrauma).toBe(3);
			expect(mutable.mentalTrauma).toBe(2);
		});

		it('defaults defeated to false', () => {
			const player = makePlayer('plr1');
			expect(player.defeated).toBe(false);
		});

		it('copies defeated when true', () => {
			const player = new ReadonlyPlayerState({
				id: 'plr1',
				character: mock<CharacterState>(),
				deck: [],
				hand: [],
				discardPile: [],
				attachments: [],
				focusesBag: new Counter(),
				focusesDiscardPile: new Counter(),
				focusesHand: new Counter(),
				physicalTrauma: 0,
				mentalTrauma: 0,
				defeated: true
			});
			const mutable = player.mutable();
			expect(mutable.defeated).toBe(true);
		});
	});

	describe('mutate', () => {
		it('applies the change and returns a new ReadonlyPlayerState', () => {
			const player = makePlayer('plr1');
			const updated = player.mutate((m) => {
				m.physicalTrauma = 5;
			});
			expect(updated).toBeInstanceOf(ReadonlyPlayerState);
			expect(updated.physicalTrauma).toBe(5);
		});

		it('does not mutate the original', () => {
			const player = makePlayer('plr1');
			player.mutate((m) => {
				m.mentalTrauma = 99;
			});
			expect(player.mentalTrauma).toBe(0);
		});

		it('preserves defeated through mutate round-trip', () => {
			const player = makePlayer('plr1');
			const updated = player.mutate((m) => {
				m.defeated = true;
			});
			expect(updated.defeated).toBe(true);
			expect(player.defeated).toBe(false);
		});

		it('preserves banished cards through mutable/readonly round-trip', () => {
			const c1 = new ReadonlyCardState({
				id: 'trt1',
				card: mock<Entity>(),
				ownerId: 'plr1',
				container: { type: 'banish', playerId: 'plr1' },
				properties: []
			});
			const player = makePlayer('plr1', { banished: [c1] });
			const roundTripped = player.mutable().readonly();
			expect(roundTripped.banishedCards).toHaveLength(1);
			expect(roundTripped.banishedCards[0].id).toBe('trt1');
		});
	});
});

// ─── MutablePlayerState.drawFromDeck ─────────────────────────────────────────

describe('MutablePlayerState.drawFromDeck', () => {
	it('moves the top deck card to hand', () => {
		const c1 = new ReadonlyCardState({
			id: 'trt1',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'deck', playerId: 'plr1' },
			properties: []
		});
		const c2 = new ReadonlyCardState({
			id: 'trt2',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'deck', playerId: 'plr1' },
			properties: []
		});
		const mutablePlayer = makePlayer('plr1', { deck: [c1, c2] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 1);

		expect(drawn).toMatchObject([{ id: 'trt1', container: { type: 'hand', playerId: 'plr1' } }]);
		expect(mutablePlayer.hand).toContain(drawn[0]);
		expect(mutablePlayer.deck).not.toContain(drawn[0]);
	});

	it('draws multiple cards in order', () => {
		const c1 = new ReadonlyCardState({
			id: 'trt1',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'deck', playerId: 'plr1' },
			properties: []
		});
		const c2 = new ReadonlyCardState({
			id: 'trt2',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'deck', playerId: 'plr1' },
			properties: []
		});
		const mutablePlayer = makePlayer('plr1', { deck: [c1, c2] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 2);

		expect(drawn).toMatchObject([
			{ id: 'trt1', container: { type: 'hand', playerId: 'plr1' } },
			{ id: 'trt2', container: { type: 'hand', playerId: 'plr1' } }
		]);
		expect(mutablePlayer.hand).toEqual(drawn);
		expect(mutablePlayer.deck).toEqual([]);
	});

	it('shuffles the discard pile into the deck when the deck is empty', () => {
		const c1 = new ReadonlyCardState({
			id: 'trt1',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'discard', playerId: 'plr1' },
			properties: []
		});
		const mutablePlayer = makePlayer('plr1', { discard: [c1] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 1);

		expect(drawn).toMatchObject([{ id: 'trt1', container: { type: 'hand', playerId: 'plr1' } }]);
		expect(mutablePlayer.hand).toEqual(drawn);
		expect(mutablePlayer.discardPile).toEqual([]);
		expect(mutablePlayer.deck).toEqual([]);
	});

	it('draws nothing when both deck and discard are empty', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState, 1);

		expect(drawn).toEqual([]);
		expect(mutablePlayer.hand).toEqual([]);
	});

	it('defaults to drawing 1 card', () => {
		const c1 = new ReadonlyCardState({
			id: 'trt1',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'deck', playerId: 'plr1' },
			properties: []
		});
		const mutablePlayer = makePlayer('plr1', { deck: [c1] }).mutable();
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		const drawn = mutablePlayer.drawFromDeck(gameState);

		expect(drawn).toMatchObject([{ id: 'trt1', container: { type: 'hand', playerId: 'plr1' } }]);
	});
});

// ─── MutablePlayerState.drawFocusToken ───────────────────────────────────────

describe('MutablePlayerState.drawFocusToken', () => {
	it('draws a token from the bag and moves it to focus hand', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		const gameState = mock<MutableGameState>();
		mutablePlayer.focusesBag.add('strength-1', 1);

		const token = mutablePlayer.drawFocusToken(gameState);

		expect(token).toBe('strength-1');
		expect(mutablePlayer.focusesBag.get('strength-1')).toBe(0);
		expect(mutablePlayer.focusesHand.get('strength-1')).toBe(1);
	});

	it('refills the bag from discard when bag is empty before drawing', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		const gameState = mock<MutableGameState>();
		mutablePlayer.focusesDiscardPile.add('agility-2', 2);

		const token = mutablePlayer.drawFocusToken(gameState);

		expect(token).toBe('agility-2');
		expect(mutablePlayer.focusesBag.get('agility-2')).toBe(1);
		expect(mutablePlayer.focusesHand.get('agility-2')).toBe(1);
		expect(mutablePlayer.focusesDiscardPile.isEmpty()).toBe(true);
	});

	it('throws when both focus bag and discard are empty', () => {
		const mutablePlayer = makePlayer('plr1').mutable();

		expect(() => mutablePlayer.drawFocusToken(mock<MutableGameState>())).toThrow(
			'Focus bag is empty'
		);
	});
});

// ─── MutablePlayerState.shuffleDiscardIntoDeck ──────────────────────────────

describe('MutablePlayerState.shuffleDiscardIntoDeck', () => {
	it('moves discard cards into the deck and updates their container', () => {
		const c1 = new ReadonlyCardState({
			id: 'trt1',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'discard', playerId: 'plr1' },
			properties: []
		});
		const mutablePlayer = makePlayer('plr1', { discard: [c1] }).mutable();

		mutablePlayer.shuffleDiscardIntoDeck(mock<MutableGameState>());

		expect(mutablePlayer.discardPile).toEqual([]);
		expect(mutablePlayer.deck).toHaveLength(1);
		expect(mutablePlayer.deck[0].container).toEqual({ type: 'deck', playerId: 'plr1' });
	});
});

// ─── MutablePlayerState.refillFocusBag ───────────────────────────────────────

describe('MutablePlayerState.refillFocusBag', () => {
	it('moves all discard tokens into bag and clears focus discard pile', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		mutablePlayer.focusesBag.add('charisma-1', 1);
		mutablePlayer.focusesDiscardPile.add('strength-1', 2);
		mutablePlayer.focusesDiscardPile.add('heroism-3', 1);

		mutablePlayer.refillFocusBag(mock<MutableGameState>());

		expect(mutablePlayer.focusesBag.get('charisma-1')).toBe(1);
		expect(mutablePlayer.focusesBag.get('strength-1')).toBe(2);
		expect(mutablePlayer.focusesBag.get('heroism-3')).toBe(1);
		expect(mutablePlayer.focusesDiscardPile.isEmpty()).toBe(true);
	});
});

// ─── MutablePlayerState.addAttachment ────────────────────────────────────────

describe('MutablePlayerState.addAttachment', () => {
	it('moves a card from hand to player attachments', () => {
		const c1 = new ReadonlyCardState({
			id: 'trt1',
			card: mock<Entity>(),
			ownerId: 'plr1',
			container: { type: 'hand', playerId: 'plr1' },
			properties: []
		});
		const mutablePlayer = makePlayer('plr1', { hand: [c1] }).mutable();
		const mutableCard = mutablePlayer.requireCard('trt1');
		const gameState = mock<MutableGameState>();
		gameState.requirePlayer.mockReturnValue(mutablePlayer);

		mutablePlayer.addAttachment(gameState, mutableCard);

		expect(mutableCard.container).toEqual({ type: 'player', playerId: 'plr1' });
		expect(mutablePlayer.attachments).toContain(mutableCard);
		expect(mutablePlayer.hand).not.toContain(mutableCard);
	});
});
