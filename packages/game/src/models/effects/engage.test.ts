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
	it('engage({ target }) creates an EngageEffect with no subject', () => {
		const target = new Target({ type: 'player' });
		const effect = engage({ target });
		expect(effect).toBeInstanceOf(EngageEffect);
		expect(effect.subject).toBeUndefined();
		expect(effect.target).toBeInstanceOf(Target);
	});

	it('engage({ subject, target }) stores subject and target as Target instances', () => {
		const subject = new Target({ type: 'player' });
		const target = new Target({ type: 'enemy' });
		const effect = engage({ subject, target });
		expect(effect.subject).toBeInstanceOf(Target);
		expect(effect.target).toBeInstanceOf(Target);
	});
});

// ─── EngageEffect.trigger — input validation ───────────────────────────────────

describe('EngageEffect.trigger — input validation', () => {
	it('throws when multiple subjects and multiple targets are both chosen', async () => {
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['p1', 'c1']);
		graph.requestInput.mockResolvedValue({ target: ['c2', 'c3'] });

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'Enemies can only be engaged to a single opponent'
		);
	});

	it('throws when no subjects are chosen', async () => {
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue([]);
		graph.requestInput.mockResolvedValue({ target: ['c1'] });

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'At least one subject must be chosen to engage'
		);
	});

	it('throws when no targets are chosen', async () => {
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['p1']);
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
		graph.requestSubjects.mockResolvedValue(['p1']);
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
		graph.requestSubjects.mockResolvedValue(['p1']);
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
		graph.requestSubjects.mockResolvedValue(['c0']);
		graph.requestInput.mockResolvedValue({ target: ['c1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await engage({ target: { type: 'enemy' } }).trigger(graph);

		expect(ally.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('attaches the creature to the player when subjects are creatures and target is a player', async () => {
		const player = makePlayer('p1');
		const creature = makeCreature('c1');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(creature);
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['c1']);
		graph.requestInput.mockResolvedValue({ target: ['p1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await engage({ target: { type: 'player' } }).trigger(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, creature);
	});

	it('attaches all creatures to the player when subjects are multiple creatures and target is a player', async () => {
		const player = makePlayer('p1');
		const c1 = makeCreature('c1');
		const c2 = makeCreature('c2');
		vi.spyOn(player, 'addAttachment').mockImplementation(() => {});
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(c1);
		mutableState.requireEntityState.calledWith('c2').mockReturnValue(c2);
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['c1', 'c2']);
		graph.requestInput.mockResolvedValue({ target: ['p1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await engage({ target: { type: 'player' } }).trigger(graph);

		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, c1);
		expect(player.addAttachment).toHaveBeenCalledWith(mutableState, c2);
	});

	it('throws when subject is a player but multiple friendly subjects are provided', async () => {
		const p1 = makePlayer('p1');
		const p2 = makePlayer('p2');
		const creature = makeCreature('c1');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(p1);
		mutableState.requireEntityState.calledWith('p2').mockReturnValue(p2);
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(creature);
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['p1', 'p2']);
		graph.requestInput.mockResolvedValue({ target: ['c1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'Only one friendly target can be chosen to engage'
		);
	});

	it('throws when subject is a player but a target is not a creature', async () => {
		const player = makePlayer('p1');
		const ally = makeAlly('c1');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(ally);
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['p1']);
		graph.requestInput.mockResolvedValue({ target: ['c1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});

	it('throws when target is a player but a subject is not a creature', async () => {
		const player = makePlayer('p1');
		const ally = makeAlly('c1');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(ally);
		mutableState.requireEntityState.calledWith('p1').mockReturnValue(player);
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['c1']);
		graph.requestInput.mockResolvedValue({ target: ['p1'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'player' } }).trigger(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});

	it('throws when neither subjects nor targets include a player or ally', async () => {
		const c1 = makeCreature('c1');
		const c2 = makeCreature('c2');
		const mutableState = mock<MutableGameState>();
		mutableState.requireEntityState.calledWith('c1').mockReturnValue(c1);
		mutableState.requireEntityState.calledWith('c2').mockReturnValue(c2);
		const graph = mock<GameGraph>();
		graph.requestSubjects.mockResolvedValue(['c1']);
		graph.requestInput.mockResolvedValue({ target: ['c2'] });
		graph.effectTriggered.mockImplementation((_effect, callback) => {
			callback(mutableState);
		});

		await expect(engage({ target: { type: 'enemy' } }).trigger(graph)).rejects.toThrow(
			'Invalid subject/target combination'
		);
	});
});
