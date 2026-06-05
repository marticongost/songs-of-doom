import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { CharacterState } from '../characters';
import type { Entity } from '../entities';
import { MutableCardState, ReadonlyCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import type { CardId, EntityId } from '../game/identifiers';
import { MutablePlayerState, ReadonlyPlayerState } from '../game/playerstate';
import type { EntityType } from '../properties/entitytypes';
import { Target } from '../target';
import { EngageEffect, engage } from './engage';

function makeCreature(id: CardId): MutableCardState {
	return new ReadonlyCardState({
		id,
		card: mock<Entity>({ type: mock<EntityType>({ id: 'creature' }) }),
		ownerId: 'plr1',
		container: { type: 'hand', playerId: 'plr1' },
		properties: []
	}).mutable();
}

function makeAlly(id: CardId): MutableCardState {
	return new ReadonlyCardState({
		id,
		card: mock<Entity>({ type: mock<EntityType>({ id: 'ally' }) }),
		ownerId: 'plr1',
		container: { type: 'hand', playerId: 'plr1' },
		properties: []
	}).mutable();
}

function makePlayer(id: EntityId): MutablePlayerState {
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

// ─── EngageEffect.apply — input validation ────────────────────────────────────

describe('EngageEffect.apply — input validation', () => {
	it('throws when no targets are chosen', async () => {
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: [] });

		await expect(engage({ target: { type: 'enemy' } }).apply(graph)).rejects.toThrow(
			'At least one target must be chosen to engage'
		);
	});
});

// ─── EngageEffect.apply ──────────────────────────────────────────────────

describe('EngageEffect.apply', () => {
	it('attaches the creature to the player when subject is a player and target is a creature', async () => {
		const player = makePlayer('plr1');
		const creature = makeCreature('crt1');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(creature);
		mutableState.requireSubject.mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['crt1'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await engage({ target: { type: 'enemy' } }).apply(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('attaches all creatures to the player when subject is a player and targets are multiple creatures', async () => {
		const player = makePlayer('plr1');
		const c1 = makeCreature('crt1');
		const c2 = makeCreature('crt2');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(c1);
		mutableState.requireEntityState.calledWith('crt2').mockReturnValue(c2);
		mutableState.requireSubject.mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['crt1', 'crt2'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await engage({ target: { type: 'enemy' } }).apply(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, c1);
		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, c2);
	});

	it('attaches the creature to the ally when subject is an ally and target is a creature', async () => {
		const ally = makeAlly('crt0');
		const creature = makeCreature('crt1');
		vi.spyOn(ally, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('crt0').mockReturnValue(ally);
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(creature);
		mutableState.requireSubject.mockReturnValue(ally);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['crt1'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await engage({ target: { type: 'enemy' } }).apply(graph);

		expect(ally.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('attaches the creature to the player when subject is a creature and target is a player', async () => {
		const player = makePlayer('plr1');
		const creature = makeCreature('crt1');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(creature);
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(player);
		mutableState.requireSubject.mockReturnValue(creature);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['plr1'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await engage({ target: { type: 'player' } }).apply(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('throws when creature subject has multiple targets', async () => {
		const player = makePlayer('plr1');
		const p2 = makePlayer('plr2');
		const creature = makeCreature('crt1');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(creature);
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('plr2').mockReturnValue(p2);
		mutableState.requireSubject.mockReturnValue(creature);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['plr1', 'plr2'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await expect(engage({ target: { type: 'player' } }).apply(graph)).rejects.toThrow(
			'Enemies can only be engaged to a single opponent'
		);
	});

	it('throws when subject is a player but a target is not a creature', async () => {
		const player = makePlayer('plr1');
		const ally = makeAlly('crt1');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('plr1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(ally);
		mutableState.requireSubject.mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['crt1'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await expect(engage({ target: { type: 'enemy' } }).apply(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});

	it('throws when subject is a creature but target is not a player or ally', async () => {
		const creature = makeCreature('crt1');
		const c2 = makeCreature('crt2');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(creature);
		mutableState.requireEntityState.calledWith('crt2').mockReturnValue(c2);
		mutableState.requireSubject.mockReturnValue(creature);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['crt2'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await expect(engage({ target: { type: 'enemy' } }).apply(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});

	it('throws when neither subject nor target is a player or ally', async () => {
		const c1 = makeCreature('crt1');
		const c2 = makeCreature('crt2');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('crt1').mockReturnValue(c1);
		mutableState.requireEntityState.calledWith('crt2').mockReturnValue(c2);
		mutableState.requireSubject.mockReturnValue(c1);
		const graph = mock<GameGraph>();
		graph.requestInput.mockResolvedValue({ target: ['crt2'] });
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await expect(engage({ target: { type: 'enemy' } }).apply(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});
});
