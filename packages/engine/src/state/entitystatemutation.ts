import { isCreature, isEncounter, type Entity } from '@songsofdoom/game';
import type { CardParent, MutableCardState } from './cardstate';
import type { MutableGameState } from './gamestate';
import type { CardId, LocationId, PlayerId } from './identifiers';

/**
 * Minimal structural interface for a mutable card-like entity. Captures only
 * the members that card mutation functions actually access. Both
 * {@link MutableCardState} and {@link MutableLocationState} satisfy this
 * structurally, avoiding issues with the {@link CardState}<Self> type parameter.
 */
export interface MutableCardLike {
	readonly id: CardId;
	readonly card: Entity;
	container: CardParent;
	attachments: Array<MutableCardState>;
	getPlayerId(): PlayerId | undefined;
}

// ─── Generic mutation helper ─────────────────────────────────────────────────

/**
 * Applies a mutation to a readonly state object and returns the updated readonly state.
 *
 * @param state - The readonly state to mutate.
 * @param change - A function that receives the mutable state and applies changes to it.
 * @returns A new readonly state with the changes applied.
 */
export function mutate<R extends { mutable(): M }, M extends { readonly(): R }>(
	state: R,
	change: (m: M) => void
): R {
	const m = state.mutable();
	change(m);
	return m.readonly();
}

// ─── Card mutation functions ─────────────────────────────────────────────────

/**
 * Removes a card from its current parent container in the game state.
 * This is the low-level operation used by all move functions.
 */
export function removeCardFromParent(card: MutableCardLike, gameState: MutableGameState): void {
	if (card.container.type === 'card') {
		const previousContainer = gameState.requireCard(card.container.cardId);
		previousContainer.attachments = previousContainer.attachments.filter((a) => a.id !== card.id);
	} else if (card.container.type === 'player') {
		const playerState = gameState.requirePlayer(card.container.playerId);
		playerState.attachments = playerState.attachments.filter((a) => a.id !== card.id);
	} else if (card.container.type === 'discard') {
		const playerState = gameState.requirePlayer(card.container.playerId);
		playerState.discardPile = playerState.discardPile.filter((c) => c.id !== card.id);
	} else if (card.container.type === 'hand') {
		const playerState = gameState.requirePlayer(card.container.playerId);
		playerState.hand = playerState.hand.filter((c) => c.id !== card.id);
	} else if (card.container.type === 'stage') {
		const playerState = gameState.requirePlayer(card.container.playerId);
		playerState.stage = playerState.stage.filter((c) => c.id !== card.id);
	} else if (card.container.type === 'deck') {
		const playerState = gameState.requirePlayer(card.container.playerId);
		playerState.deck = playerState.deck.filter((c) => c.id !== card.id);
	} else if (card.container.type === 'location') {
		const locationState = gameState.requireCard(card.container.locationId);
		locationState.attachments = locationState.attachments.filter((a) => a.id !== card.id);
	} else if (card.container.type === 'banish') {
		const playerState = gameState.requirePlayer(card.container.playerId);
		playerState.banishedCards = playerState.banishedCards.filter((c) => c.id !== card.id);
	} else if (card.container.type === 'encounter-deck') {
		gameState.encounterDeck = gameState.encounterDeck.filter((c) => c.id !== card.id);
	} else if (card.container.type === 'encounter-discard') {
		gameState.encounterDiscardPile = gameState.encounterDiscardPile.filter((c) => c.id !== card.id);
	}
}

/**
 * Attaches a card to another card.
 *
 * The attachment is removed from its current parent and added to the target
 * card's attachments array.
 */
export function addAttachmentToCard(
	target: MutableCardLike,
	gameState: MutableGameState,
	attachment: MutableCardState
): void {
	removeCardFromParent(attachment, gameState);
	attachment.container = { type: 'card', cardId: target.id };
	target.attachments.push(attachment);
}

/**
 * Moves a card to a player's attachments.
 */
export function moveCardToPlayer(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId: PlayerId
): void {
	removeCardFromParent(card, gameState);
	card.container = { type: 'player', playerId };
	const playerState = gameState.requirePlayer(playerId);
	playerState.attachments.push(card as MutableCardState);
}

/**
 * Moves a card to the top of the appropriate discard pile.
 *
 * Creature and encounter cards go to the encounter discard pile; all others go
 * to the owning player's discard pile.
 */
export function moveCardToTopOfDiscardPile(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId?: PlayerId
): void {
	if (isCreature(card.card) || isEncounter(card.card)) {
		if (playerId !== undefined) {
			throw new Error('Encounter/creature cards do not belong to a player discard pile');
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'encounter-discard' };
		gameState.encounterDiscardPile.unshift(card as MutableCardState);
	} else {
		playerId = playerId ?? card.getPlayerId();
		if (!playerId) {
			throw new Error("Can't move a card without specifying its player id");
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.unshift(card as MutableCardState);
	}
}

/**
 * Moves a card to the bottom of the appropriate discard pile.
 */
export function moveCardToBottomOfDiscardPile(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId?: PlayerId
): void {
	if (isCreature(card.card) || isEncounter(card.card)) {
		if (playerId !== undefined) {
			throw new Error('Encounter/creature cards do not belong to a player discard pile');
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'encounter-discard' };
		gameState.encounterDiscardPile.push(card as MutableCardState);
	} else {
		playerId = playerId ?? card.getPlayerId();
		if (!playerId) {
			throw new Error("Can't move a card without specifying its player id");
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'discard', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.discardPile.push(card as MutableCardState);
	}
}

/**
 * Moves a card to a player's hand.
 */
export function moveCardToHand(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId: PlayerId
): void {
	removeCardFromParent(card, gameState);
	card.container = { type: 'hand', playerId };
	const playerState = gameState.requirePlayer(playerId);
	playerState.hand.push(card as MutableCardState);
}

/**
 * Moves a card to a player's stage.
 */
export function moveCardToStage(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId: PlayerId
): void {
	removeCardFromParent(card, gameState);
	card.container = { type: 'stage', playerId };
	const playerState = gameState.requirePlayer(playerId);
	playerState.stage.push(card as MutableCardState);
}

/**
 * Moves a card to the top of the appropriate deck.
 */
export function moveCardToTopOfDeck(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId?: PlayerId
): void {
	if (isCreature(card.card) || isEncounter(card.card)) {
		if (playerId !== undefined) {
			throw new Error('Encounter/creature cards do not belong to a player deck');
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'encounter-deck' };
		gameState.encounterDeck.unshift(card as MutableCardState);
	} else {
		playerId = playerId ?? card.getPlayerId();
		if (!playerId) {
			throw new Error("Can't move a card without specifying its player id");
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'deck', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.deck.unshift(card as MutableCardState);
	}
}

/**
 * Moves a card to the bottom of the appropriate deck.
 */
export function moveCardToBottomOfDeck(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId?: PlayerId
): void {
	if (isCreature(card.card) || isEncounter(card.card)) {
		if (playerId !== undefined) {
			throw new Error('Encounter/creature cards do not belong to a player deck');
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'encounter-deck' };
		gameState.encounterDeck.push(card as MutableCardState);
	} else {
		playerId = playerId ?? card.getPlayerId();
		if (!playerId) {
			throw new Error("Can't move a card without specifying its player id");
		}
		removeCardFromParent(card, gameState);
		card.container = { type: 'deck', playerId };
		const playerState = gameState.requirePlayer(playerId);
		playerState.deck.push(card as MutableCardState);
	}
}

/**
 * Moves a card to a location, attaching it there.
 */
export function moveCardToLocation(
	card: MutableCardLike,
	gameState: MutableGameState,
	locationId: LocationId
): void {
	removeCardFromParent(card, gameState);
	card.container = { type: 'location', locationId };
	const locationState = gameState.requireCard(locationId);
	locationState.attachments.push(card as MutableCardState);
}

/**
 * Banishes a card, moving it to the owning player's banished cards.
 */
export function banishCard(
	card: MutableCardLike,
	gameState: MutableGameState,
	playerId?: PlayerId
): void {
	playerId = playerId ?? card.getPlayerId();
	if (!playerId) {
		throw new Error("Can't banish a card without specifying its player id");
	}
	removeCardFromParent(card, gameState);
	card.container = { type: 'banish', playerId };
	const playerState = gameState.requirePlayer(playerId);
	playerState.banishedCards.push(card as MutableCardState);
}
