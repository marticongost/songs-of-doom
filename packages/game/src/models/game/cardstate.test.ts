import { describe, expect, it } from 'vitest';
import type { Capability, Entity, Property } from '../..';
import { Obligation } from '../capabilities/reaction';
import { CharacterState } from '../characters';
import { events, type EventType } from '../event';
import { skill, trait } from '../properties';
import { MutableCardState, ReadonlyCardState, type CardLocation } from './cardstate';
import { ReadonlyGameState } from './gamestate';
import type { CardId, PlayerId } from './identifiers';
import { ReadonlyPlayerState } from './playerstate';

// Minimal entity stub that does not require catalog metadata
function makeEntity(overrides?: {
	type?: Entity['type'];
	properties?: Array<Property>;
	capabilities?: Array<Capability>;
	attachmentCapabilities?: Array<Capability>;
}): Entity {
	const type = overrides?.type ?? trait;
	const explicitProperties = overrides?.properties ?? [];
	return {
		type,
		get properties() {
			return [type, ...explicitProperties];
		},
		capabilities: overrides?.capabilities ?? [],
		attachmentCapabilities: overrides?.attachmentCapabilities ?? []
	} as unknown as Entity;
}

function makeReadonlyCard(
	id: CardId,
	ownerId: PlayerId,
	location: CardLocation,
	overrides?: Partial<{
		exhausted: boolean;
		charges: number;
		physicalTrauma: number;
		mentalTrauma: number;
		entity: Entity;
		attachments: ReadonlyArray<ReadonlyCardState>;
	}>
): ReadonlyCardState {
	return new ReadonlyCardState({
		id,
		card: overrides?.entity ?? makeEntity(),
		ownerId,
		location,
		exhausted: overrides?.exhausted,
		charges: overrides?.charges,
		physicalTrauma: overrides?.physicalTrauma,
		mentalTrauma: overrides?.mentalTrauma,
		attachments: overrides?.attachments
	});
}

function makeReadonlyPlayer(
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
		character: CharacterState.initial(),
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

function makeReadonlyGameState(players: ReadonlyPlayerState[]): ReadonlyGameState {
	return new ReadonlyGameState({ players });
}

// ─── CardState ───────────────────────────────────────────────────────────────

describe('CardState', () => {
	describe('constructor defaults', () => {
		it('defaults exhausted to false', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.exhausted).toBe(false);
		});

		it('defaults charges to 0', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.charges).toBe(0);
		});

		it('defaults attachments to empty array', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.attachments).toEqual([]);
		});

		it('defaults physicalTrauma to 0', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.physicalTrauma).toBe(0);
		});

		it('defaults mentalTrauma to 0', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.mentalTrauma).toBe(0);
		});

		it('stores explicit values when provided', () => {
			const card = makeReadonlyCard(
				'c2',
				'p1',
				{ container: 'deck', playerId: 'p1' },
				{
					exhausted: true,
					charges: 3,
					physicalTrauma: 1,
					mentalTrauma: 2
				}
			);
			expect(card.exhausted).toBe(true);
			expect(card.charges).toBe(3);
			expect(card.physicalTrauma).toBe(1);
			expect(card.mentalTrauma).toBe(2);
		});
	});

	describe('getCard', () => {
		it('returns itself when the id matches', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.getCard('c1')).toBe(card);
		});

		it('returns undefined when id is unknown and there are no attachments', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.getCard('c99')).toBeUndefined();
		});

		it('finds a direct attachment by id', () => {
			const attachment = makeReadonlyCard('c2', 'p1', { container: 'card', cardId: 'c1' });
			const card = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					attachments: [attachment]
				}
			);
			expect(card.getCard('c2')).toBe(attachment);
		});

		it('finds a nested attachment recursively', () => {
			const nested = makeReadonlyCard('c3', 'p1', { container: 'card', cardId: 'c2' });
			const middle = makeReadonlyCard(
				'c2',
				'p1',
				{ container: 'card', cardId: 'c1' },
				{
					attachments: [nested]
				}
			);
			const root = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					attachments: [middle]
				}
			);
			expect(root.getCard('c3')).toBe(nested);
		});
	});

	describe('requireCard', () => {
		it('returns itself when the id matches', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.requireCard('c1')).toBe(card);
		});

		it('throws when id is unknown and there are no attachments', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(() => card.requireCard('c99')).toThrow('c99');
		});

		it('finds a direct attachment by id', () => {
			const attachment = makeReadonlyCard('c2', 'p1', { container: 'card', cardId: 'c1' });
			const card = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					attachments: [attachment]
				}
			);
			expect(card.requireCard('c2')).toBe(attachment);
		});

		it('finds a nested attachment recursively', () => {
			const nested = makeReadonlyCard('c3', 'p1', { container: 'card', cardId: 'c2' });
			const middle = makeReadonlyCard(
				'c2',
				'p1',
				{ container: 'card', cardId: 'c1' },
				{
					attachments: [nested]
				}
			);
			const root = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					attachments: [middle]
				}
			);
			expect(root.requireCard('c3')).toBe(nested);
		});
	});

	describe('hasProperty', () => {
		it('returns true for the entity type property', () => {
			const card = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					entity: makeEntity({ type: trait })
				}
			);
			expect(card.hasProperty(trait)).toBe(true);
		});

		it('returns true for an explicit property', () => {
			const prop = skill; // reuse a known Property instance
			const card = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					entity: makeEntity({ type: trait, properties: [prop] })
				}
			);
			expect(card.hasProperty(prop)).toBe(true);
		});

		it('returns false for a property the card does not have', () => {
			const card = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					entity: makeEntity({ type: trait })
				}
			);
			expect(card.hasProperty(skill)).toBe(false);
		});
	});

	describe('isAttached', () => {
		it('returns false for cards in deck', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'deck', playerId: 'p1' });
			expect(card.isAttached()).toBe(false);
		});

		it('returns false for cards in hand', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			expect(card.isAttached()).toBe(false);
		});

		it('returns false for cards in discard', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'discard', playerId: 'p1' });
			expect(card.isAttached()).toBe(false);
		});

		it('returns true for cards attached to another card', () => {
			const card = makeReadonlyCard('c2', 'p1', { container: 'card', cardId: 'c1' });
			expect(card.isAttached()).toBe(true);
		});

		it('returns true for cards attached to a player', () => {
			const card = makeReadonlyCard('c2', 'p1', { container: 'player', playerId: 'p1' });
			expect(card.isAttached()).toBe(true);
		});
	});

	describe('getReactionsToEvent', () => {
		const reaction = new Obligation({
			effects: [],
			triggers: ['attacking']
		});
		const attachmentReaction = new Obligation({
			effects: [],
			triggers: ['defending' as EventType]
		});

		it('returns matching reactions for non-skill entities', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction]
			});
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' }, { entity });
			expect(card.getReactionsToEvent('attacking')).toContain(reaction);
		});

		it('accepts an Event object instead of an EventType string', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction]
			});
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' }, { entity });
			expect(card.getReactionsToEvent(events['attacking'])).toContain(reaction);
		});

		it('does not return reactions for non-matching events', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction]
			});
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' }, { entity });
			expect(card.getReactionsToEvent('investigating')).toEqual([]);
		});

		it('includes attachment capabilities for non-skill entities when attached', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction],
				attachmentCapabilities: [attachmentReaction]
			});
			const card = makeReadonlyCard('c2', 'p1', { container: 'card', cardId: 'c1' }, { entity });
			const results = card.getReactionsToEvent('defending' as EventType);
			expect(results).toContain(attachmentReaction);
		});

		it('uses only attachmentCapabilities for skill entities when attached', () => {
			const entity = makeEntity({
				type: skill,
				capabilities: [reaction],
				attachmentCapabilities: [attachmentReaction]
			});
			const card = makeReadonlyCard('c2', 'p1', { container: 'card', cardId: 'c1' }, { entity });
			// skill entity when attached: only attachmentCapabilities are used
			expect(card.getReactionsToEvent('defending' as EventType)).toContain(attachmentReaction);
			expect(card.getReactionsToEvent('attacking')).toEqual([]);
		});

		it('uses only regular capabilities for skill entities when not attached', () => {
			const entity = makeEntity({
				type: skill,
				capabilities: [reaction],
				attachmentCapabilities: [attachmentReaction]
			});
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' }, { entity });
			expect(card.getReactionsToEvent('attacking')).toContain(reaction);
			expect(card.getReactionsToEvent('defending' as EventType)).toEqual([]);
		});
	});
});

// ─── ReadonlyCardState ────────────────────────────────────────────────────────

describe('ReadonlyCardState', () => {
	describe('mutable', () => {
		it('returns a MutableCardState with the same data', () => {
			const readonly = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					exhausted: true,
					charges: 5
				}
			);
			const mutable = readonly.mutable();
			expect(mutable).toBeInstanceOf(MutableCardState);
			expect(mutable.id).toBe('c1');
			expect(mutable.exhausted).toBe(true);
			expect(mutable.charges).toBe(5);
		});

		it('converts attachments to MutableCardState', () => {
			const attachment = makeReadonlyCard('c2', 'p1', { container: 'card', cardId: 'c1' });
			const card = makeReadonlyCard(
				'c1',
				'p1',
				{ container: 'hand', playerId: 'p1' },
				{
					attachments: [attachment]
				}
			);
			const mutable = card.mutable();
			expect(mutable.attachments[0]).toBeInstanceOf(MutableCardState);
		});
	});

	describe('mutate', () => {
		it('applies the change and returns a new ReadonlyCardState', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const updated = card.mutate((m) => {
				m.exhausted = true;
			});
			expect(updated).toBeInstanceOf(ReadonlyCardState);
			expect(updated.exhausted).toBe(true);
		});

		it('does not mutate the original', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			card.mutate((m) => {
				m.charges = 99;
			});
			expect(card.charges).toBe(0);
		});
	});
});

// ─── MutableCardState ─────────────────────────────────────────────────────────

describe('MutableCardState', () => {
	describe('readonly', () => {
		it('returns a ReadonlyCardState with the same data', () => {
			const readonly = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const mutable = readonly.mutable();
			mutable.charges = 7;
			const back = mutable.readonly();
			expect(back).toBeInstanceOf(ReadonlyCardState);
			expect(back.charges).toBe(7);
		});
	});

	describe('addAttachment', () => {
		it('moves the attachment to the card and adds it to its attachments list', () => {
			const attachmentCard = makeReadonlyCard('c2', 'p1', { container: 'hand', playerId: 'p1' });
			const baseCard = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', {
				hand: [baseCard, attachmentCard]
			});
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableBase = gameState.requireCard('c1');
			const mutableAttachment = gameState.requireCard('c2');

			mutableBase.addAttachment(gameState, mutableAttachment);

			expect(mutableAttachment.location).toEqual({ container: 'card', cardId: 'c1' });
			expect(mutableBase.attachments).toContain(mutableAttachment);
			// removed from hand
			expect(gameState.requirePlayer('p1').hand).not.toContain(mutableAttachment);
		});
	});

	describe('moveToHand', () => {
		it('moves a card from deck to hand', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'deck', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', { deck: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('c1');
			mutableCard.moveToHand(gameState, 'p1');

			expect(mutableCard.location).toEqual({ container: 'hand', playerId: 'p1' });
			expect(gameState.requirePlayer('p1').hand).toContain(mutableCard);
			expect(gameState.requirePlayer('p1').deck).not.toContain(mutableCard);
		});
	});

	describe('moveToTopOfDiscardPile', () => {
		it('places the card at the front of the discard pile', () => {
			const existing = makeReadonlyCard('c2', 'p1', { container: 'discard', playerId: 'p1' });
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', { hand: [card], discard: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('c1');
			mutableCard.moveToTopOfDiscardPile(gameState);

			const discard = gameState.requirePlayer('p1').discardPile;
			expect(discard[0]).toBe(mutableCard);
		});

		it('uses the card owner when no playerId is given', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', { hand: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('c1');
			mutableCard.moveToTopOfDiscardPile(gameState);

			expect(mutableCard.location).toEqual({ container: 'discard', playerId: 'p1' });
		});
	});

	describe('moveToBottomOfDiscardPile', () => {
		it('places the card at the end of the discard pile', () => {
			const existing = makeReadonlyCard('c2', 'p1', { container: 'discard', playerId: 'p1' });
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', { hand: [card], discard: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('c1');
			mutableCard.moveToBottomOfDiscardPile(gameState);

			const discard = gameState.requirePlayer('p1').discardPile;
			expect(discard[discard.length - 1]).toBe(mutableCard);
		});
	});

	describe('moveToTopOfDeck', () => {
		it('places the card at the front of the deck', () => {
			const existing = makeReadonlyCard('c2', 'p1', { container: 'deck', playerId: 'p1' });
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', { hand: [card], deck: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('c1');
			mutableCard.moveToTopOfDeck(gameState);

			const deck = gameState.requirePlayer('p1').deck;
			expect(deck[0]).toBe(mutableCard);
		});
	});

	describe('moveToBottomOfDeck', () => {
		it('places the card at the end of the deck', () => {
			const existing = makeReadonlyCard('c2', 'p1', { container: 'deck', playerId: 'p1' });
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', { hand: [card], deck: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('c1');
			mutableCard.moveToBottomOfDeck(gameState);

			const deck = gameState.requirePlayer('p1').deck;
			expect(deck[deck.length - 1]).toBe(mutableCard);
		});
	});

	describe('moveToPlayer', () => {
		it('attaches the card to the player', () => {
			const card = makeReadonlyCard('c1', 'p1', { container: 'hand', playerId: 'p1' });
			const player = makeReadonlyPlayer('p1', { hand: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('c1');
			mutableCard.moveToPlayer(gameState, 'p1');

			expect(mutableCard.location).toEqual({ container: 'player', playerId: 'p1' });
			expect(gameState.requirePlayer('p1').attachments).toContain(mutableCard);
			expect(gameState.requirePlayer('p1').hand).not.toContain(mutableCard);
		});
	});
});
