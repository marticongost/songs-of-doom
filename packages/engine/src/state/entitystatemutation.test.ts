import { Counter } from '@songsofdoom/common';
import {
	CharacterState,
	creature,
	encounter,
	trait,
	type Capability,
	type Entity,
	type Property
} from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ReadonlyCardState, type CardParent } from './cardstate';
import {
	addAttachmentToCard,
	banishCard,
	moveCardToBottomOfDeck,
	moveCardToBottomOfDiscardPile,
	moveCardToHand,
	moveCardToLocation,
	moveCardToPlayer,
	moveCardToStage,
	moveCardToTopOfDeck,
	moveCardToTopOfDiscardPile,
	removeCardFromParent
} from './entitystatemutation';
import { ReadonlyGameState } from './gamestate';
import type { CardId, EntityId, LocationId, PlayerId } from './identifiers';
import { ReadonlyLocationState } from './locationstate';
import { ReadonlyPlayerState } from './playerstate';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
	ownerId: EntityId,
	container: CardParent,
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
		container,
		exhausted: overrides?.exhausted,
		charges: overrides?.charges,
		physicalTrauma: overrides?.physicalTrauma,
		mentalTrauma: overrides?.mentalTrauma,
		attachments: overrides?.attachments
	});
}

function makeReadonlyLocation(
	id: LocationId,
	overrides?: Partial<{
		ownerId: EntityId;
		clues: number;
		players: ReadonlyArray<EntityId>;
		attachments: ReadonlyArray<ReadonlyCardState>;
	}>
): ReadonlyLocationState {
	return new ReadonlyLocationState({
		id,
		card: makeEntity(),
		ownerId: overrides?.ownerId ?? 'plr1',
		container: { type: 'location', locationId: id },
		attachments: overrides?.attachments,
		clues: overrides?.clues,
		players: overrides?.players
	});
}

function makeReadonlyPlayer(
	id: PlayerId,
	cards: {
		deck?: ReadonlyCardState[];
		hand?: ReadonlyCardState[];
		discard?: ReadonlyCardState[];
		attachments?: ReadonlyCardState[];
		banished?: ReadonlyCardState[];
	} = {}
): ReadonlyPlayerState {
	return new ReadonlyPlayerState({
		id,
		character: CharacterState.initial(),
		deck: cards.deck ?? [],
		hand: cards.hand ?? [],
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

function makeReadonlyGameState(
	players: ReadonlyPlayerState[],
	locations: ReadonlyLocationState[] = [],
	encounterDeck: ReadonlyArray<ReadonlyCardState> = [],
	encounterDiscardPile: ReadonlyArray<ReadonlyCardState> = []
): ReadonlyGameState {
	return new ReadonlyGameState({ players, locations, encounterDeck, encounterDiscardPile });
}

// ─── removeCardFromParent ────────────────────────────────────────────────────

describe('removeCardFromParent', () => {
	it('removes a card from its player hand', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		removeCardFromParent(mutableCard, gameState);

		expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
	});

	it('removes a card from its player deck', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'deck', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { deck: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		removeCardFromParent(mutableCard, gameState);

		expect(gameState.requirePlayer('plr1').deck).not.toContain(mutableCard);
	});

	it('removes a card from the encounter deck', () => {
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'encounter-deck' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [card]).mutable();

		const mutableCard = gameState.encounterDeck[0];
		removeCardFromParent(mutableCard, gameState);

		expect(gameState.encounterDeck).not.toContain(mutableCard);
	});

	it('removes a card from the encounter discard pile', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'encounter-discard' },
			{ entity: makeEntity({ type: encounter }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [], [card]).mutable();

		const mutableCard = gameState.encounterDiscardPile[0];
		removeCardFromParent(mutableCard, gameState);

		expect(gameState.encounterDiscardPile).not.toContain(mutableCard);
	});
});

// ─── addAttachmentToCard ─────────────────────────────────────────────────────

describe('addAttachmentToCard', () => {
	it('moves the attachment to the target card and adds it to its attachments list', () => {
		const attachmentCard = makeReadonlyCard('trt2', 'plr1', { type: 'hand', playerId: 'plr1' });
		const baseCard = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', {
			hand: [baseCard, attachmentCard]
		});
		const gameState = makeReadonlyGameState([player]).mutable();

		const target = gameState.requireCard('trt1');
		const attachment = gameState.requireCard('trt2');

		addAttachmentToCard(target, gameState, attachment);

		expect(attachment.container).toEqual({ type: 'card', cardId: 'trt1' });
		expect(target.attachments).toContain(attachment);
		expect(gameState.requirePlayer('plr1').hand).not.toContain(attachment);
	});
});

// ─── moveCardToHand ──────────────────────────────────────────────────────────

describe('moveCardToHand', () => {
	it('moves a card from deck to hand', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'deck', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { deck: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToHand(mutableCard, gameState, 'plr1');

		expect(mutableCard.container).toEqual({ type: 'hand', playerId: 'plr1' });
		expect(gameState.requirePlayer('plr1').hand).toContain(mutableCard);
		expect(gameState.requirePlayer('plr1').deck).not.toContain(mutableCard);
	});
});

// ─── moveCardToStage ─────────────────────────────────────────────────────────

describe('moveCardToStage', () => {
	it('moves a card from hand to stage', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToStage(mutableCard, gameState, 'plr1');

		expect(mutableCard.container).toEqual({ type: 'stage', playerId: 'plr1' });
		expect(gameState.requirePlayer('plr1').stage).toContain(mutableCard);
		expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
	});
});

// ─── moveCardToTopOfDiscardPile ──────────────────────────────────────────────

describe('moveCardToTopOfDiscardPile', () => {
	it('places the card at the front of the discard pile', () => {
		const existing = makeReadonlyCard('trt2', 'plr1', { type: 'discard', playerId: 'plr1' });
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card], discard: [existing] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToTopOfDiscardPile(mutableCard, gameState);

		const discard = gameState.requirePlayer('plr1').discardPile;
		expect(discard[0]).toBe(mutableCard);
	});

	it('uses the card owner when no playerId is given', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToTopOfDiscardPile(mutableCard, gameState);

		expect(mutableCard.container).toEqual({ type: 'discard', playerId: 'plr1' });
	});

	it('routes a creature card to the encounter discard pile', () => {
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('crt1');
		moveCardToTopOfDiscardPile(mutableCard, gameState);

		expect(mutableCard.container).toEqual({ type: 'encounter-discard' });
		expect(gameState.encounterDiscardPile[0]).toBe(mutableCard);
		expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
	});

	it('routes an encounter card to the encounter discard pile', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{ entity: makeEntity({ type: encounter }) }
		);
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToTopOfDiscardPile(mutableCard, gameState);

		expect(mutableCard.container).toEqual({ type: 'encounter-discard' });
		expect(gameState.encounterDiscardPile[0]).toBe(mutableCard);
	});

	it('throws when a playerId is supplied for a creature card', () => {
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'encounter-deck' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [card]).mutable();

		const mutableCard = gameState.encounterDeck[0];
		expect(() => moveCardToTopOfDiscardPile(mutableCard, gameState, 'plr1')).toThrow();
	});
});

// ─── moveCardToBottomOfDiscardPile ───────────────────────────────────────────

describe('moveCardToBottomOfDiscardPile', () => {
	it('places the card at the end of the discard pile', () => {
		const existing = makeReadonlyCard('trt2', 'plr1', { type: 'discard', playerId: 'plr1' });
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card], discard: [existing] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToBottomOfDiscardPile(mutableCard, gameState);

		const discard = gameState.requirePlayer('plr1').discardPile;
		expect(discard[discard.length - 1]).toBe(mutableCard);
	});

	it('routes a creature card to the end of the encounter discard pile', () => {
		const existing = makeReadonlyCard(
			'crt2',
			'plr1',
			{ type: 'encounter-discard' },
			{ entity: makeEntity({ type: creature }) }
		);
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player], [], [], [existing]).mutable();

		const mutableCard = gameState.requireCard('crt1');
		moveCardToBottomOfDiscardPile(mutableCard, gameState);

		const pile = gameState.encounterDiscardPile;
		expect(pile[pile.length - 1]).toBe(mutableCard);
	});

	it('throws when a playerId is supplied for an encounter card', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'encounter-deck' },
			{ entity: makeEntity({ type: encounter }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [card]).mutable();

		const mutableCard = gameState.encounterDeck[0];
		expect(() => moveCardToBottomOfDiscardPile(mutableCard, gameState, 'plr1')).toThrow();
	});
});

// ─── moveCardToTopOfDeck ─────────────────────────────────────────────────────

describe('moveCardToTopOfDeck', () => {
	it('places the card at the front of the deck', () => {
		const existing = makeReadonlyCard('trt2', 'plr1', { type: 'deck', playerId: 'plr1' });
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card], deck: [existing] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToTopOfDeck(mutableCard, gameState);

		const deck = gameState.requirePlayer('plr1').deck;
		expect(deck[0]).toBe(mutableCard);
	});

	it('routes a creature card to the encounter deck', () => {
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('crt1');
		moveCardToTopOfDeck(mutableCard, gameState);

		expect(mutableCard.container).toEqual({ type: 'encounter-deck' });
		expect(gameState.encounterDeck[0]).toBe(mutableCard);
		expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
	});

	it('routes an encounter card to the encounter deck', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{ entity: makeEntity({ type: encounter }) }
		);
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToTopOfDeck(mutableCard, gameState);

		expect(mutableCard.container).toEqual({ type: 'encounter-deck' });
		expect(gameState.encounterDeck[0]).toBe(mutableCard);
	});

	it('throws when a playerId is supplied for a creature card', () => {
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'encounter-discard' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [], [card]).mutable();

		const mutableCard = gameState.encounterDiscardPile[0];
		expect(() => moveCardToTopOfDeck(mutableCard, gameState, 'plr1')).toThrow();
	});
});

// ─── moveCardToBottomOfDeck ──────────────────────────────────────────────────

describe('moveCardToBottomOfDeck', () => {
	it('places the card at the end of the deck', () => {
		const existing = makeReadonlyCard('trt2', 'plr1', { type: 'deck', playerId: 'plr1' });
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card], deck: [existing] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToBottomOfDeck(mutableCard, gameState);

		const deck = gameState.requirePlayer('plr1').deck;
		expect(deck[deck.length - 1]).toBe(mutableCard);
	});

	it('routes a creature card to the end of the encounter deck', () => {
		const existing = makeReadonlyCard(
			'crt2',
			'plr1',
			{ type: 'encounter-deck' },
			{ entity: makeEntity({ type: creature }) }
		);
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player], [], [existing]).mutable();

		const mutableCard = gameState.requireCard('crt1');
		moveCardToBottomOfDeck(mutableCard, gameState);

		const deck = gameState.encounterDeck;
		expect(deck[deck.length - 1]).toBe(mutableCard);
	});

	it('throws when a playerId is supplied for an encounter card', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'encounter-discard' },
			{ entity: makeEntity({ type: encounter }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [], [card]).mutable();

		const mutableCard = gameState.encounterDiscardPile[0];
		expect(() => moveCardToBottomOfDeck(mutableCard, gameState, 'plr1')).toThrow();
	});
});

// ─── moveCardToPlayer ────────────────────────────────────────────────────────

describe('moveCardToPlayer', () => {
	it('attaches the card to the player', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToPlayer(mutableCard, gameState, 'plr1');

		expect(mutableCard.container).toEqual({ type: 'player', playerId: 'plr1' });
		expect(gameState.requirePlayer('plr1').attachments).toContain(mutableCard);
		expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
	});
});

// ─── moveCardToLocation ──────────────────────────────────────────────────────

describe('moveCardToLocation', () => {
	it('attaches the card to the location', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const location = makeReadonlyLocation('loc9');
		const gameState = makeReadonlyGameState([player], [location]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		const mutableLocation = gameState.requireCard('loc9');
		moveCardToLocation(mutableCard, gameState, 'loc9');

		expect(mutableCard.container).toEqual({ type: 'location', locationId: 'loc9' });
		expect(mutableLocation.attachments).toContain(mutableCard);
		expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
	});
});

// ─── banishCard ──────────────────────────────────────────────────────────────

describe('banishCard', () => {
	it('moves a card from hand to banished cards', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { hand: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		banishCard(mutableCard, gameState);

		expect(mutableCard.container).toEqual({ type: 'banish', playerId: 'plr1' });
		expect(gameState.requirePlayer('plr1').banishedCards).toContain(mutableCard);
		expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
	});

	it('uses the card owner when no playerId is given', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'deck', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { deck: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		banishCard(mutableCard, gameState);

		expect(mutableCard.container).toEqual({ type: 'banish', playerId: 'plr1' });
	});

	it('removes the card from banishedCards when it is subsequently moved elsewhere', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'banish', playerId: 'plr1' });
		const player = makeReadonlyPlayer('plr1', { banished: [card] });
		const gameState = makeReadonlyGameState([player]).mutable();

		const mutableCard = gameState.requireCard('trt1');
		moveCardToHand(mutableCard, gameState, 'plr1');

		expect(mutableCard.container).toEqual({ type: 'hand', playerId: 'plr1' });
		expect(gameState.requirePlayer('plr1').banishedCards).not.toContain(mutableCard);
		expect(gameState.requirePlayer('plr1').hand).toContain(mutableCard);
	});
});

// ─── Round-trips ─────────────────────────────────────────────────────────────

describe('encounter-deck / encounter-discard round-trips', () => {
	it('removes a card from the encounter deck when it moves to the encounter discard pile', () => {
		const card = makeReadonlyCard(
			'crt1',
			'plr1',
			{ type: 'encounter-deck' },
			{ entity: makeEntity({ type: creature }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [card]).mutable();

		const mutableCard = gameState.encounterDeck[0];
		moveCardToTopOfDiscardPile(mutableCard, gameState);

		expect(gameState.encounterDeck).not.toContain(mutableCard);
		expect(gameState.encounterDiscardPile).toContain(mutableCard);
	});

	it('removes a card from the encounter discard pile when it moves to the encounter deck', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'encounter-discard' },
			{ entity: makeEntity({ type: encounter }) }
		);
		const player = makeReadonlyPlayer('plr1');
		const gameState = makeReadonlyGameState([player], [], [], [card]).mutable();

		const mutableCard = gameState.encounterDiscardPile[0];
		moveCardToTopOfDeck(mutableCard, gameState);

		expect(gameState.encounterDiscardPile).not.toContain(mutableCard);
		expect(gameState.encounterDeck).toContain(mutableCard);
	});
});
