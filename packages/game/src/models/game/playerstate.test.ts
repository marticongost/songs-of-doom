import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { CharacterState } from '../characters';
import type { Entity } from '../entities';
import { health, strength } from '../stats';
import { MutableCardState, ReadonlyCardState } from './cardstate';
import type { MutableGameState } from './gamestate';
import type { CardId, PlayerId } from './identifiers';
import { ReadonlyPlayerState } from './playerstate';
import type { CardOptions } from './sequence/cardcontainer';

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
	const makeMockCard = (cardOptions?: CardOptions): ReadonlyCardState => {
		const cardState = mock<ReadonlyCardState>();
		cardState.cards.mockImplementation((options?: CardOptions) => {
			if (JSON.stringify(options) === JSON.stringify(cardOptions)) {
				return [cardState];
			}
			throw new Error(`Unexpected card option propagation: ${JSON.stringify(options)}`);
		});
		return cardState;
	};

	it('returns cards from all zones (hand, stage, deck, discard, attachments, banished)', () => {
		const inHand = makeMockCard();
		const inStage = makeMockCard();
		const inDeck = makeMockCard();
		const inDiscard = makeMockCard();
		const attached = makeMockCard();
		const banished = makeMockCard();

		const player = makePlayer('plr1', {
			hand: [inHand],
			stage: [inStage],
			deck: [inDeck],
			discard: [inDiscard],
			attachments: [attached],
			banished: [banished]
		});

		const all = player.cards();
		expect(all).toContain(inHand);
		expect(all).toContain(inStage);
		expect(all).toContain(inDeck);
		expect(all).toContain(inDiscard);
		expect(all).toContain(attached);
		expect(all).toContain(banished);
	});

	it('with ready:true excludes deck, discard and banished zones', () => {
		const inHand = makeMockCard({ ready: true });
		const inStage = makeMockCard({ ready: true });
		const attached = makeMockCard({ ready: true });
		const inDeck = makeMockCard({ ready: true });
		const inDiscard = makeMockCard({ ready: true });
		const banished = makeMockCard({ ready: true });

		const player = makePlayer('plr1', {
			hand: [inHand],
			stage: [inStage],
			attachments: [attached],
			deck: [inDeck],
			discard: [inDiscard],
			banished: [banished]
		});

		const ready = player.cards({ ready: true });
		expect(ready).toContain(inHand);
		expect(ready).toContain(inStage);
		expect(ready).toContain(attached);
		expect(ready).not.toContain(inDeck);
		expect(ready).not.toContain(inDiscard);
		expect(ready).not.toContain(banished);
	});

	it('propagates card type', () => {
		const inHand = makeMockCard({ type: 'skill' });
		const inStage = makeMockCard({ type: 'skill' });
		const attached = makeMockCard({ type: 'skill' });
		const inDeck = makeMockCard({ type: 'skill' });
		const inDiscard = makeMockCard({ type: 'skill' });
		const banished = makeMockCard({ type: 'skill' });

		const player = makePlayer('plr1', {
			hand: [inHand],
			stage: [inStage],
			attachments: [attached],
			deck: [inDeck],
			discard: [inDiscard],
			banished: [banished]
		});

		const ready = player.cards({ type: 'skill' });
		expect(ready).toContain(inHand);
		expect(ready).toContain(inStage);
		expect(ready).toContain(attached);
		expect(ready).toContain(inDeck);
		expect(ready).toContain(inDiscard);
		expect(ready).toContain(banished);
	});

	it('propagates includeAttachments', () => {
		const inHand = makeMockCard({ includeAttachments: true });
		const inStage = makeMockCard({ includeAttachments: true });
		const attached = makeMockCard({ includeAttachments: true });
		const inDeck = makeMockCard({ includeAttachments: true });
		const inDiscard = makeMockCard({ includeAttachments: true });
		const banished = makeMockCard({ includeAttachments: true });

		const player = makePlayer('plr1', {
			hand: [inHand],
			stage: [inStage],
			attachments: [attached],
			deck: [inDeck],
			discard: [inDiscard],
			banished: [banished]
		});

		const includeAttachments = player.cards({ includeAttachments: true });
		expect(includeAttachments).toContain(inHand);
		expect(includeAttachments).toContain(inStage);
		expect(includeAttachments).toContain(attached);
		expect(includeAttachments).toContain(inDeck);
		expect(includeAttachments).toContain(inDiscard);
		expect(includeAttachments).toContain(banished);
	});
});

// ─── PlayerState.getCard ──────────────────────────────────────────────────────

describe('PlayerState.getCard', () => {
	const makeMockCard = (id: CardId, child?: ReadonlyCardState): ReadonlyCardState => {
		const cardState = mock<ReadonlyCardState>({ id });
		cardState.cards.mockImplementation((_options?: CardOptions) => [cardState]);
		cardState.getCard.mockImplementation((cardId: string) => {
			if (cardId === id) return cardState;
			if (child && child.id === cardId) return child;
			return undefined;
		});
		return cardState;
	};

	it('finds a card in hand', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { hand: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in deck', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { deck: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in the discard pile', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { discard: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in attachments', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { attachments: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a card in banished cards', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { banished: [c1] });
		expect(player.getCard('trt1')).toBe(c1);
	});

	it('finds a nested attachment on a hand card', () => {
		const nested = makeMockCard('trt2');
		const parent = makeMockCard('trt1', nested);
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
	const makeMockCard = (id: CardId, child?: ReadonlyCardState): ReadonlyCardState => {
		const cardState = mock<ReadonlyCardState>({ id });
		cardState.cards.mockImplementation((_options?: CardOptions) => [cardState]);
		cardState.getCard.mockImplementation((cardId: string) => {
			if (cardId === id) return cardState;
			if (child && child.id === cardId) return child;
			return undefined;
		});
		return cardState;
	};

	it('finds a card in hand', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { hand: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in deck', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { deck: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in the discard pile', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { discard: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in attachments', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { attachments: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a card in banished cards', () => {
		const c1 = makeMockCard('trt1');
		const player = makePlayer('plr1', { banished: [c1] });
		expect(player.requireCard('trt1')).toBe(c1);
	});

	it('finds a nested attachment on a hand card', () => {
		const nested = makeMockCard('trt2');
		const parent = makeMockCard('trt1', nested);
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

// ─── MutablePlayerState.discardFocusToken ─────────────────────────────────────

describe('MutablePlayerState.discardFocusToken', () => {
	it('can discard a single token from hand to discard pile', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		mutablePlayer.focusesHand.add('strength-1', 1);

		mutablePlayer.discardFocusToken('strength-1');

		expect(mutablePlayer.focusesHand.get('strength-1')).toBe(0);
		expect(mutablePlayer.focusesDiscardPile.get('strength-1')).toBe(1);
	});

	it('can discard all tokens at once', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		mutablePlayer.focusesHand.add('agility-2', 3);

		mutablePlayer.discardFocusToken('agility-2', 3);

		expect(mutablePlayer.focusesHand.get('agility-2')).toBe(0);
		expect(mutablePlayer.focusesDiscardPile.get('agility-2')).toBe(3);
	});

	it('can discard a partial amount of tokens', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		mutablePlayer.focusesHand.add('strength-1', 5);

		mutablePlayer.discardFocusToken('strength-1', 2);

		expect(mutablePlayer.focusesHand.get('strength-1')).toBe(3);
		expect(mutablePlayer.focusesDiscardPile.get('strength-1')).toBe(2);
	});

	it('defaults to discarding a single token', () => {
		const mutablePlayer = makePlayer('plr1').mutable();
		mutablePlayer.focusesHand.add('heroism-3', 1);

		mutablePlayer.discardFocusToken('heroism-3');

		expect(mutablePlayer.focusesHand.get('heroism-3')).toBe(0);
		expect(mutablePlayer.focusesDiscardPile.get('heroism-3')).toBe(1);
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

// ─── PlayerState.getStat ──────────────────────────────────────────────────────

function makePlayerWithCharacter(id: PlayerId): ReadonlyPlayerState {
	return new ReadonlyPlayerState({
		id,
		character: CharacterState.initial(),
		deck: [],
		hand: [],
		discardPile: [],
		attachments: [],
		focusesBag: new Counter(),
		focusesDiscardPile: new Counter(),
		focusesHand: new Counter(),
		physicalTrauma: 0,
		mentalTrauma: 0
	});
}

describe('PlayerState.getStat', () => {
	it('getStat(Stat) returns the base attribute value for a fresh character', () => {
		const player = makePlayerWithCharacter('plr1');
		// CharacterState.initial() starts attributes at STARTING_ATTRIBUTE_VALUE = 3
		expect(player.getStat(strength)).toBe(3);
	});

	it('getStat(StatType string) returns the same value as getStat(Stat)', () => {
		const player = makePlayerWithCharacter('plr1');
		expect(player.getStat('strength')).toBe(player.getStat(strength));
	});

	it('getStat(StatType string) returns indicator values', () => {
		const player = makePlayerWithCharacter('plr1');
		// CharacterState.initial() starts indicators at STARTING_INDICATOR_VALUE = 7
		expect(player.getStat('health')).toBe(7);
	});

	it('getStat(Stat indicator) returns the indicator value', () => {
		const player = makePlayerWithCharacter('plr1');
		expect(player.getStat(health)).toBe(7);
	});
});
