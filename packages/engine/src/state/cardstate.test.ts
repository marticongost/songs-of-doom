import { Counter } from '@songsofdoom/common';
import {
	ally,
	CharacterState,
	creature,
	encounter,
	events,
	Obligation,
	reactiveCardIsTarget,
	reactivePlayerIsNotActivePlayer,
	reactivePlayerIsSubject,
	reactivePlayerIsTarget,
	skill,
	strength,
	trait,
	type Capability,
	type Entity,
	type Property
} from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { MutableCardState, ReadonlyCardState, type CardParent } from './cardstate';
import { ReadonlyGameState } from './gamestate';
import type { CardId, EntityId, LocationId, PlayerId } from './identifiers';
import { ReadonlyLocationState } from './locationstate';
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

// ─── CardState ───────────────────────────────────────────────────────────────

describe('CardState', () => {
	describe('constructor defaults', () => {
		it('defaults exhausted to false', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.exhausted).toBe(false);
		});

		it('defaults charges to 0', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.charges).toBe(0);
		});

		it('defaults attachments to empty array', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.attachments).toEqual([]);
		});

		it('defaults physicalTrauma to 0', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.physicalTrauma).toBe(0);
		});

		it('defaults mentalTrauma to 0', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.mentalTrauma).toBe(0);
		});

		it('stores explicit values when provided', () => {
			const card = makeReadonlyCard(
				'trt2',
				'plr1',
				{ type: 'deck', playerId: 'plr1' },
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
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.getCard('trt1')).toBe(card);
		});

		it('returns undefined when id is unknown and there are no attachments', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.getCard('trt99')).toBeUndefined();
		});

		it('finds a direct attachment by id', () => {
			const attachment = makeReadonlyCard('trt2', 'plr1', { type: 'card', cardId: 'trt1' });
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					attachments: [attachment]
				}
			);
			expect(card.getCard('trt2')).toBe(attachment);
		});

		it('finds a nested attachment recursively', () => {
			const nested = makeReadonlyCard('trt3', 'plr1', { type: 'card', cardId: 'trt2' });
			const middle = makeReadonlyCard(
				'trt2',
				'plr1',
				{ type: 'card', cardId: 'trt1' },
				{
					attachments: [nested]
				}
			);
			const root = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					attachments: [middle]
				}
			);
			expect(root.getCard('trt3')).toBe(nested);
		});
	});

	describe('requireCard', () => {
		it('returns itself when the id matches', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.requireCard('trt1')).toBe(card);
		});

		it('throws when id is unknown and there are no attachments', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(() => card.requireCard('trt99')).toThrow('trt99');
		});

		it('finds a direct attachment by id', () => {
			const attachment = makeReadonlyCard('trt2', 'plr1', { type: 'card', cardId: 'trt1' });
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					attachments: [attachment]
				}
			);
			expect(card.requireCard('trt2')).toBe(attachment);
		});

		it('finds a nested attachment recursively', () => {
			const nested = makeReadonlyCard('trt3', 'plr1', { type: 'card', cardId: 'trt2' });
			const middle = makeReadonlyCard(
				'trt2',
				'plr1',
				{ type: 'card', cardId: 'trt1' },
				{
					attachments: [nested]
				}
			);
			const root = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					attachments: [middle]
				}
			);
			expect(root.requireCard('trt3')).toBe(nested);
		});
	});

	describe('hasProperty', () => {
		it('returns true for the entity type property', () => {
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					entity: makeEntity({ type: trait })
				}
			);
			expect(card.hasProperty(trait)).toBe(true);
		});

		it('returns true for an explicit property', () => {
			const prop = skill; // reuse a known Property instance
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					entity: makeEntity({ type: trait, properties: [prop] })
				}
			);
			expect(card.hasProperty(prop)).toBe(true);
		});

		it('returns false for a property the card does not have', () => {
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					entity: makeEntity({ type: trait })
				}
			);
			expect(card.hasProperty(skill)).toBe(false);
		});
	});

	describe('getProperty', () => {
		it('returns the property instance when found', () => {
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					entity: makeEntity({ type: trait })
				}
			);
			expect(card.getProperty(trait)).toBe(trait);
		});

		it('returns undefined when the property is not present', () => {
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					entity: makeEntity({ type: trait })
				}
			);
			expect(card.getProperty(skill)).toBeUndefined();
		});
	});

	describe('isAttached', () => {
		it('returns false for cards in deck', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'deck', playerId: 'plr1' });
			expect(card.isAttached()).toBe(false);
		});

		it('returns false for cards in hand', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			expect(card.isAttached()).toBe(false);
		});

		it('returns false for cards in discard', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'discard', playerId: 'plr1' });
			expect(card.isAttached()).toBe(false);
		});

		it('returns true for cards attached to another card', () => {
			const card = makeReadonlyCard('trt2', 'plr1', { type: 'card', cardId: 'trt1' });
			expect(card.isAttached()).toBe(true);
		});

		it('returns true for cards attached to a player', () => {
			const card = makeReadonlyCard('trt2', 'plr1', { type: 'player', playerId: 'plr1' });
			expect(card.isAttached()).toBe(true);
		});
	});

	describe('getReactionsToEvent', () => {
		const reaction = new Obligation({
			effects: [],
			triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }]
		});
		const attachmentReaction = new Obligation({
			effects: [],
			triggers: [{ event: 'attack', condition: reactiveCardIsTarget }]
		});

		it('returns matching reactions for non-skill entities', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction]
			});
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' }, { entity });
			const state = makeReadonlyGameState([makeReadonlyPlayer('plr1', { hand: [card] })]).mutate(
				(s) => s.subjectStack.push('plr1')
			);
			expect(card.getReactionsToEvent(events['attack'], state)).toContain(reaction);
		});

		it('does not return reactions for non-matching events', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction]
			});
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' }, { entity });
			const state = makeReadonlyGameState([makeReadonlyPlayer('plr1', { hand: [card] })]);
			expect(card.getReactionsToEvent(events['investigation'], state)).toEqual([]);
		});

		it('includes attachment capabilities for non-skill entities when attached', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction],
				attachmentCapabilities: [attachmentReaction]
			});
			const card = makeReadonlyCard('trt2', 'plr1', { type: 'card', cardId: 'trt1' }, { entity });
			const state = makeReadonlyGameState([makeReadonlyPlayer('plr1', { hand: [card] })]).mutate(
				(s) => s.targetStack.push('trt2')
			);
			const results = card.getReactionsToEvent(events['attack'], state);
			expect(results).toContain(attachmentReaction);
		});

		it('uses only attachmentCapabilities for skill entities when attached', () => {
			const entity = makeEntity({
				type: skill,
				capabilities: [reaction],
				attachmentCapabilities: [attachmentReaction]
			});
			const card = makeReadonlyCard('trt2', 'plr1', { type: 'card', cardId: 'trt1' }, { entity });
			// skill entity when attached: only attachmentCapabilities are used
			const state = makeReadonlyGameState([makeReadonlyPlayer('plr1', { hand: [card] })]).mutate(
				(s) => s.targetStack.push('trt2')
			);
			expect(card.getReactionsToEvent(events['attack'], state)).toEqual([attachmentReaction]);
		});

		it('uses only regular capabilities for skill entities when not attached', () => {
			const entity = makeEntity({
				type: skill,
				capabilities: [reaction],
				attachmentCapabilities: [attachmentReaction]
			});
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' }, { entity });
			const state = makeReadonlyGameState([makeReadonlyPlayer('plr1', { hand: [card] })]).mutate(
				(s) => s.subjectStack.push('plr1')
			);
			expect(card.getReactionsToEvent(events['attack'], state)).toEqual([reaction]);
		});

		it('filters attack reactions by subject when context is provided', () => {
			const entity = makeEntity({
				type: trait,
				capabilities: [reaction]
			});
			const attacker = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{ entity }
			);
			const observer = makeReadonlyCard(
				'trt2',
				'plr2',
				{ type: 'hand', playerId: 'plr2' },
				{ entity }
			);
			const state = makeReadonlyGameState([
				makeReadonlyPlayer('plr1', { hand: [attacker] }),
				makeReadonlyPlayer('plr2', { hand: [observer] })
			]);

			const stateWithSubject = state.mutate((s) => {
				s.subjectStack.push('plr1');
			});

			expect(attacker.getReactionsToEvent(events['attack'], stateWithSubject)).toContain(reaction);
			expect(observer.getReactionsToEvent(events['attack'], stateWithSubject)).toEqual([]);
		});

		it('filters attack reactions by target when context is provided', () => {
			const receivingAttackReaction = new Obligation({
				effects: [],
				triggers: [{ event: 'attack', condition: reactiveCardIsTarget }]
			});
			const entity = makeEntity({
				type: trait,
				capabilities: [receivingAttackReaction]
			});
			const defender = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{ entity }
			);
			const observer = makeReadonlyCard(
				'trt2',
				'plr2',
				{ type: 'hand', playerId: 'plr2' },
				{ entity }
			);
			const state = makeReadonlyGameState([
				makeReadonlyPlayer('plr1', { hand: [defender] }),
				makeReadonlyPlayer('plr2', { hand: [observer] })
			]);

			const stateWithTarget = state.mutate((s) => {
				s.targetStack.push('trt1');
			});

			expect(defender.getReactionsToEvent(events['attack'], stateWithTarget)).toContain(
				receivingAttackReaction
			);
			expect(observer.getReactionsToEvent(events['attack'], stateWithTarget)).toEqual([]);
		});

		it('supports explicit trigger.when expressions without participation', () => {
			const attackingReaction = new Obligation({
				effects: [],
				triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }]
			});
			const receivingAttackReaction = new Obligation({
				effects: [],
				triggers: [{ event: 'attack', condition: reactiveCardIsTarget }]
			});
			const otherPlayerReaction = new Obligation({
				effects: [],
				triggers: [
					{
						event: 'beforeDrawingFate',
						condition: reactivePlayerIsNotActivePlayer
					}
				]
			});
			const entity = makeEntity({
				type: trait,
				capabilities: [attackingReaction, receivingAttackReaction, otherPlayerReaction]
			});
			const card1 = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{ entity }
			);
			const card2 = makeReadonlyCard(
				'trt2',
				'plr2',
				{ type: 'hand', playerId: 'plr2' },
				{ entity }
			);
			const state = makeReadonlyGameState([
				makeReadonlyPlayer('plr1', { hand: [card1] }),
				makeReadonlyPlayer('plr2', { hand: [card2] })
			]).mutate((mutableState) => {
				mutableState.subjectStack.push('plr1');
			});

			const stateWithSubjectPlr1 = state.mutate((s) => {
				s.subjectStack.push('plr1');
			});
			const stateWithTargetTrt1 = state.mutate((s) => {
				s.targetStack.push('trt1');
			});

			expect(card1.getReactionsToEvent(events['attack'], stateWithSubjectPlr1)).toContain(
				attackingReaction
			);
			expect(card2.getReactionsToEvent(events['attack'], stateWithSubjectPlr1)).toEqual([]);

			expect(card1.getReactionsToEvent(events['attack'], stateWithTargetTrt1)).toContain(
				receivingAttackReaction
			);
			expect(card2.getReactionsToEvent(events['attack'], stateWithTargetTrt1)).toEqual([]);

			expect(card1.getReactionsToEvent(events['beforeDrawingFate'], state)).toEqual([]);
			expect(card2.getReactionsToEvent(events['beforeDrawingFate'], state)).toContain(
				otherPlayerReaction
			);
		});

		it('supports owner-targeted attack reactions via reactivePlayerIsTarget', () => {
			const ownerTargetReaction = new Obligation({
				effects: [],
				triggers: [{ event: 'attack', condition: reactivePlayerIsTarget }]
			});
			const entity = makeEntity({
				type: trait,
				capabilities: [ownerTargetReaction]
			});
			const ownerReactiveCard = makeReadonlyCard(
				'trt10',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{ entity }
			);
			const otherPlayerCard = makeReadonlyCard(
				'trt11',
				'plr2',
				{ type: 'hand', playerId: 'plr2' },
				{ entity }
			);
			const state = makeReadonlyGameState([
				makeReadonlyPlayer('plr1', { hand: [ownerReactiveCard] }),
				makeReadonlyPlayer('plr2', { hand: [otherPlayerCard] })
			]);

			const stateWithTarget = state.mutate((s) => {
				s.targetStack.push('plr1');
			});

			expect(ownerReactiveCard.getReactionsToEvent(events['attack'], stateWithTarget)).toContain(
				ownerTargetReaction
			);
			expect(otherPlayerCard.getReactionsToEvent(events['attack'], stateWithTarget)).toEqual([]);
		});

		it('supports card-targeted attack reactions via reactiveCardIsTarget', () => {
			const cardTargetReaction = new Obligation({
				effects: [],
				triggers: [{ event: 'attack', condition: reactiveCardIsTarget }]
			});
			const entity = makeEntity({
				type: trait,
				capabilities: [cardTargetReaction]
			});
			const targetedCard = makeReadonlyCard(
				'trt10',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{ entity }
			);
			const sameOwnerOtherCard = makeReadonlyCard(
				'trt11',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{ entity }
			);
			const otherPlayerCard = makeReadonlyCard(
				'trt12',
				'plr2',
				{ type: 'hand', playerId: 'plr2' },
				{ entity }
			);
			const state = makeReadonlyGameState([
				makeReadonlyPlayer('plr1', { hand: [targetedCard, sameOwnerOtherCard] }),
				makeReadonlyPlayer('plr2', { hand: [otherPlayerCard] })
			]);

			const stateWithTarget = state.mutate((s) => {
				s.targetStack.push('trt10');
			});

			expect(targetedCard.getReactionsToEvent(events['attack'], stateWithTarget)).toContain(
				cardTargetReaction
			);
			expect(sameOwnerOtherCard.getReactionsToEvent(events['attack'], stateWithTarget)).toEqual([]);
			expect(otherPlayerCard.getReactionsToEvent(events['attack'], stateWithTarget)).toEqual([]);
		});
	});
});

// ─── ReadonlyCardState ────────────────────────────────────────────────────────

describe('ReadonlyCardState', () => {
	describe('mutable', () => {
		it('returns a MutableCardState with the same data', () => {
			const readonly = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
				{
					exhausted: true,
					charges: 5
				}
			);
			const mutable = readonly.mutable();
			expect(mutable).toBeInstanceOf(MutableCardState);
			expect(mutable.id).toBe('trt1');
			expect(mutable.exhausted).toBe(true);
			expect(mutable.charges).toBe(5);
		});

		it('converts attachments to MutableCardState', () => {
			const attachment = makeReadonlyCard('trt2', 'plr1', { type: 'card', cardId: 'trt1' });
			const card = makeReadonlyCard(
				'trt1',
				'plr1',
				{ type: 'hand', playerId: 'plr1' },
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
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const updated = card.mutate((m) => {
				m.exhausted = true;
			});
			expect(updated).toBeInstanceOf(ReadonlyCardState);
			expect(updated.exhausted).toBe(true);
		});

		it('does not mutate the original', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
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
			const readonly = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const mutable = readonly.mutable();
			mutable.charges = 7;
			const back = mutable.readonly();
			expect(back).toBeInstanceOf(ReadonlyCardState);
			expect(back.charges).toBe(7);
		});
	});

	describe('addAttachment', () => {
		it('moves the attachment to the card and adds it to its attachments list', () => {
			const attachmentCard = makeReadonlyCard('trt2', 'plr1', { type: 'hand', playerId: 'plr1' });
			const baseCard = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', {
				hand: [baseCard, attachmentCard]
			});
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableBase = gameState.requireCard('trt1');
			const mutableAttachment = gameState.requireCard('trt2');

			mutableBase.addAttachment(gameState, mutableAttachment);

			expect(mutableAttachment.container).toEqual({ type: 'card', cardId: 'trt1' });
			expect(mutableBase.attachments).toContain(mutableAttachment);
			// removed from hand
			expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableAttachment);
		});
	});

	describe('moveToHand', () => {
		it('moves a card from deck to hand', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'deck', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { deck: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToHand(gameState, 'plr1');

			expect(mutableCard.container).toEqual({ type: 'hand', playerId: 'plr1' });
			expect(gameState.requirePlayer('plr1').hand).toContain(mutableCard);
			expect(gameState.requirePlayer('plr1').deck).not.toContain(mutableCard);
		});
	});

	describe('moveToStage', () => {
		it('moves a card from hand to stage', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToStage(gameState, 'plr1');

			expect(mutableCard.container).toEqual({ type: 'stage', playerId: 'plr1' });
			expect(gameState.requirePlayer('plr1').stage).toContain(mutableCard);
			expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
		});
	});

	describe('moveToTopOfDiscardPile', () => {
		it('places the card at the front of the discard pile', () => {
			const existing = makeReadonlyCard('trt2', 'plr1', { type: 'discard', playerId: 'plr1' });
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card], discard: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToTopOfDiscardPile(gameState);

			const discard = gameState.requirePlayer('plr1').discardPile;
			expect(discard[0]).toBe(mutableCard);
		});

		it('uses the card owner when no playerId is given', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToTopOfDiscardPile(gameState);

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
			mutableCard.moveToTopOfDiscardPile(gameState);

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
			mutableCard.moveToTopOfDiscardPile(gameState);

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
			expect(() => mutableCard.moveToTopOfDiscardPile(gameState, 'plr1')).toThrow();
		});
	});

	describe('moveToBottomOfDiscardPile', () => {
		it('places the card at the end of the discard pile', () => {
			const existing = makeReadonlyCard('trt2', 'plr1', { type: 'discard', playerId: 'plr1' });
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card], discard: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToBottomOfDiscardPile(gameState);

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
			mutableCard.moveToBottomOfDiscardPile(gameState);

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
			expect(() => mutableCard.moveToBottomOfDiscardPile(gameState, 'plr1')).toThrow();
		});
	});

	describe('moveToTopOfDeck', () => {
		it('places the card at the front of the deck', () => {
			const existing = makeReadonlyCard('trt2', 'plr1', { type: 'deck', playerId: 'plr1' });
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card], deck: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToTopOfDeck(gameState);

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
			mutableCard.moveToTopOfDeck(gameState);

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
			mutableCard.moveToTopOfDeck(gameState);

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
			expect(() => mutableCard.moveToTopOfDeck(gameState, 'plr1')).toThrow();
		});
	});

	describe('moveToBottomOfDeck', () => {
		it('places the card at the end of the deck', () => {
			const existing = makeReadonlyCard('trt2', 'plr1', { type: 'deck', playerId: 'plr1' });
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card], deck: [existing] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToBottomOfDeck(gameState);

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
			mutableCard.moveToBottomOfDeck(gameState);

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
			expect(() => mutableCard.moveToBottomOfDeck(gameState, 'plr1')).toThrow();
		});
	});

	describe('moveToPlayer', () => {
		it('attaches the card to the player', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToPlayer(gameState, 'plr1');

			expect(mutableCard.container).toEqual({ type: 'player', playerId: 'plr1' });
			expect(gameState.requirePlayer('plr1').attachments).toContain(mutableCard);
			expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
		});
	});

	describe('moveToLocation', () => {
		it('attaches the card to the location', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card] });
			const location = makeReadonlyLocation('loc9');
			const gameState = makeReadonlyGameState([player], [location]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			const mutableLocation = gameState.requireCard('loc9');
			mutableCard.moveToLocation(gameState, 'loc9');

			expect(mutableCard.container).toEqual({ type: 'location', locationId: 'loc9' });
			expect(mutableLocation.attachments).toContain(mutableCard);
			expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
		});
	});

	describe('banish', () => {
		it('moves a card from hand to banished cards', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { hand: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.banish(gameState);

			expect(mutableCard.container).toEqual({ type: 'banish', playerId: 'plr1' });
			expect(gameState.requirePlayer('plr1').banishedCards).toContain(mutableCard);
			expect(gameState.requirePlayer('plr1').hand).not.toContain(mutableCard);
		});

		it('uses the card owner when no playerId is given', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'deck', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { deck: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.banish(gameState);

			expect(mutableCard.container).toEqual({ type: 'banish', playerId: 'plr1' });
		});

		it('removes the card from banishedCards when it is subsequently moved elsewhere', () => {
			const card = makeReadonlyCard('trt1', 'plr1', { type: 'banish', playerId: 'plr1' });
			const player = makeReadonlyPlayer('plr1', { banished: [card] });
			const gameState = makeReadonlyGameState([player]).mutable();

			const mutableCard = gameState.requireCard('trt1');
			mutableCard.moveToHand(gameState, 'plr1');

			expect(mutableCard.container).toEqual({ type: 'hand', playerId: 'plr1' });
			expect(gameState.requirePlayer('plr1').banishedCards).not.toContain(mutableCard);
			expect(gameState.requirePlayer('plr1').hand).toContain(mutableCard);
		});
	});

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
			mutableCard.moveToTopOfDiscardPile(gameState);

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
			mutableCard.moveToTopOfDeck(gameState);

			expect(gameState.encounterDiscardPile).not.toContain(mutableCard);
			expect(gameState.encounterDeck).toContain(mutableCard);
		});
	});
});

// ─── CardState.getStat ────────────────────────────────────────────────────────

function makeCreatureEntity(stats: Record<string, number>): Entity {
	return {
		type: creature,
		get properties() {
			return [creature];
		},
		capabilities: [],
		attachmentCapabilities: [],
		stats
	} as unknown as Entity;
}

function makeAllyEntity(stats: Record<string, number>): Entity {
	return {
		type: ally,
		get properties() {
			return [ally];
		},
		capabilities: [],
		attachmentCapabilities: [],
		stats
	} as unknown as Entity;
}

describe('CardState.getStat', () => {
	it('returns the stat value from a creature card by StatType string', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{
				entity: makeCreatureEntity({
					strength: 4,
					agility: 2,
					intelligence: 1,
					charisma: 1,
					will: 1,
					health: 6
				})
			}
		);
		expect(card.getStat('strength')).toBe(4);
	});

	it('returns the stat value from a creature card by Stat object', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{
				entity: makeCreatureEntity({
					strength: 3,
					agility: 2,
					intelligence: 1,
					charisma: 1,
					will: 1,
					health: 5
				})
			}
		);
		expect(card.getStat(strength)).toBe(3);
	});

	it('returns undefined for sanity on a creature card', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{
				entity: makeCreatureEntity({
					strength: 3,
					agility: 2,
					intelligence: 1,
					charisma: 1,
					will: 1,
					health: 5
				})
			}
		);
		expect(card.getStat('sanity')).toBeUndefined();
	});

	it('returns the stat value from an ally card', () => {
		const card = makeReadonlyCard(
			'trt1',
			'plr1',
			{ type: 'hand', playerId: 'plr1' },
			{
				entity: makeAllyEntity({
					strength: 2,
					agility: 3,
					intelligence: 4,
					charisma: 5,
					will: 2,
					health: 8,
					sanity: 6
				})
			}
		);
		expect(card.getStat('health')).toBe(8);
	});

	it('returns undefined for a trait card', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		expect(card.getStat('strength')).toBeUndefined();
	});
});

// ─── CardState.getPlayerId ────────────────────────────────────────────────────

describe('CardState.getPlayerId', () => {
	it('returns the playerId from a hand container', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'hand', playerId: 'plr1' });
		expect(card.getPlayerId()).toBe('plr1');
	});

	it('returns the playerId from a deck container', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'deck', playerId: 'plr1' });
		expect(card.getPlayerId()).toBe('plr1');
	});

	it('returns the playerId from a stage container', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'stage', playerId: 'plr1' });
		expect(card.getPlayerId()).toBe('plr1');
	});

	it('returns the playerId from a discard container', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'discard', playerId: 'plr1' });
		expect(card.getPlayerId()).toBe('plr1');
	});

	it('returns the playerId from a banish container', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'banish', playerId: 'plr1' });
		expect(card.getPlayerId()).toBe('plr1');
	});

	it('returns the playerId from a player container', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'player', playerId: 'plr1' });
		expect(card.getPlayerId()).toBe('plr1');
	});

	it('returns undefined for a card container (no playerId)', () => {
		const card = makeReadonlyCard('trt2', 'plr1', { type: 'card', cardId: 'trt1' });
		expect(card.getPlayerId()).toBeUndefined();
	});

	it('returns undefined for a location container (no playerId)', () => {
		const card = makeReadonlyCard('trt1', 'plr1', { type: 'location', locationId: 'loc1' });
		expect(card.getPlayerId()).toBeUndefined();
	});

	it('returns undefined for an encounter-deck container (no playerId)', () => {
		const card = makeReadonlyCard('crt1', 'plr1', { type: 'encounter-deck' });
		expect(card.getPlayerId()).toBeUndefined();
	});

	it('returns undefined for an encounter-discard container (no playerId)', () => {
		const card = makeReadonlyCard('crt1', 'plr1', { type: 'encounter-discard' });
		expect(card.getPlayerId()).toBeUndefined();
	});
});
