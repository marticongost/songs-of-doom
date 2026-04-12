import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { CharacterState } from '../characters';
import type { Entity } from '../entities';
import { MutableCardState, ReadonlyCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { CardId, PlayerId } from '../game/identifiers';
import { MutablePlayerState, ReadonlyPlayerState } from '../game/playerstate';
import type { EntityType } from '../properties/entitytypes';
import { Target } from '../target';
import { EngageEffect, engage } from './engage';

function makeCreature(id: CardId): MutableCardState {
	return new ReadonlyCardState({
		id,
		card: mock<Entity>({ type: mock<EntityType>({ id: 'creature' }) }),
		ownerId: 'p1',
		container: { type: 'hand', playerId: 'p1' },
		properties: []
	}).mutable();
}

function makeAlly(id: CardId): MutableCardState {
	return new ReadonlyCardState({
		id,
		card: mock<Entity>({ type: mock<EntityType>({ id: 'ally' }) }),
		ownerId: 'p1',
		container: { type: 'hand', playerId: 'p1' },
		properties: []
	}).mutable();
}

function makePlayer(id: PlayerId): MutablePlayerState {
	return new ReadonlyPlayerState({
		id,
		character: mock<CharacterState>(),
		deck: [],
		hand: [],
		discardPile: [],
		attachments: [],
		focusesBag: new Counter(),
		focusesDiscardPile: new Counter(),
		focusesHand: new Counter(),
		physicalTrauma: 0,
		mentalTrauma: 0
	}).mutable();
}

// ─── EngageEffect construction ─────────────────────────────────────────────────

describe('EngageEffect construction', () => {
	it('engage({ target }) creates an EngageEffect with the given target', () => {
		const target = new Target({ type: 'player' });
		const effect = engage({ target });
		expect(effect).toBeInstanceOf(EngageEffect);
		expect(effect.target).toBeInstanceOf(Target);
	});
});

// ─── EngageEffect.trigger — input validation ───────────────────────────────────

describe('EngageEffect.trigger — input validation', () => {
	it('throws when no targets are chosen', async () => {
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(makePlayer('p1'));
		graph.requestInput.mockResolvedValue({ target: [] });

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'At least one target must be chosen to engage'
		);
	});
});

// ─── EngageEffect.trigger ──────────────────────────────────────────────────────

describe('EngageEffect.trigger', () => {
	it('attaches the creature to the player when subject is a player and target is a creature', async () => {
		const player = makePlayer('p1');
		const creature = makeCreature('c1');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(creature);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(player);
		graph.requestInput.mockResolvedValue({ target: ['c1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await engage({ target: { type: 'enemy' } }).trigger(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('attaches all creatures to the player when subject is a player and targets are multiple creatures', async () => {
		const player = makePlayer('p1');
		const c1 = makeCreature('c1');
		const c2 = makeCreature('c2');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(c1);
		mutableState.requireEntityState.calledWith('c2').mockReturnValue(c2);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(player);
		graph.requestInput.mockResolvedValue({ target: ['c1', 'c2'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await engage({ target: { type: 'enemy' } }).trigger(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, c1);
		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, c2);
	});

	it('attaches the creature to the ally when subject is an ally and target is a creature', async () => {
		const ally = makeAlly('c0');
		const creature = makeCreature('c1');
		vi.spyOn(ally, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c0').mockReturnValue(ally);
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(creature);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(ally);
		graph.requestInput.mockResolvedValue({ target: ['c1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await engage({ target: { type: 'enemy' } }).trigger(graph);

		expect(ally.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('attaches the creature to the player when subject is a creature and target is a player', async () => {
		const player = makePlayer('p1');
		const creature = makeCreature('c1');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(creature);
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(creature);
		graph.requestInput.mockResolvedValue({ target: ['p1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await engage({ target: { type: 'player' } }).trigger(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('throws when creature subject has multiple targets', async () => {
		const player = makePlayer('p1');
		const p2 = makePlayer('p2');
		const creature = makeCreature('c1');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(creature);
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('p2').mockReturnValue(p2);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(creature);
		graph.requestInput.mockResolvedValue({ target: ['p1', 'p2'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'player' } }).trigger(graph)).rejects.toThrow(
			'Enemies can only be engaged to a single opponent'
		);
	});

	it('throws when subject is a player but a target is not a creature', async () => {
		const player = makePlayer('p1');
		const ally = makeAlly('c1');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(ally);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(player);
		graph.requestInput.mockResolvedValue({ target: ['c1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});

	it('throws when subject is a creature but target is not a player or ally', async () => {
		const creature = makeCreature('c1');
		const c2 = makeCreature('c2');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(creature);
		mutableState.requireEntityState.calledWith('c2').mockReturnValue(c2);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(creature);
		graph.requestInput.mockResolvedValue({ target: ['c2'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});

	it('throws when neither subject nor target is a player or ally', async () => {
		const c1 = makeCreature('c1');
		const c2 = makeCreature('c2');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(c1);
		mutableState.requireEntityState.calledWith('c2').mockReturnValue(c2);
		const graph = mock<GameGraph>();
		graph.requireSubject.mockReturnValue(c1);
		graph.requestInput.mockResolvedValue({ target: ['c2'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});
});
