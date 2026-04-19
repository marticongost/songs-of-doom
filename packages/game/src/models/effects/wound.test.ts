import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { CharacterState } from '../characters';
import { distance } from '../expressions/scalar/distance';
import { ReadonlyAttackResolution } from '../game/attackresolution';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState, ReadonlyGameState } from '../game/gamestate';
import type { MutablePlayerState } from '../game/playerstate';
import { ReadonlyPlayerState } from '../game/playerstate';
import { MutableWoundResolution } from '../game/woundresolution';
import { Target } from '../target';
import { WoundEffect, wound } from './wound';

function makePlayer(
	id: 'plr1' | 'plr2',
	physicalTrauma: number
): { readonly: ReadonlyPlayerState; mutable: MutablePlayerState } {
	const readonly = new ReadonlyPlayerState({
		id,
		character: CharacterState.initial(),
		deck: [],
		hand: [],
		discardPile: [],
		attachments: [],
		focusesBag: new Counter(),
		focusesDiscardPile: new Counter(),
		focusesHand: new Counter(),
		physicalTrauma,
		mentalTrauma: 0
	});
	return { readonly, mutable: readonly.mutable() };
}

// ─── wound() factory — literal damage ────────────────────────────────────────

describe('wound() factory — literal damage', () => {
	it('wound(n) creates a WoundEffect with numeric damage', () => {
		const effect = wound(3);
		expect(effect).toBeInstanceOf(WoundEffect);
		expect(effect.damage).toBe(3);
	});

	it('wound(n) defaults causedByAttack to false', () => {
		expect(wound(3).causedByAttack).toBe(false);
	});

	it('wound(n) defaults properties to empty array', () => {
		expect(wound(3).properties).toEqual([]);
	});

	it('wound(n) has no target by default', () => {
		expect(wound(3).target).toBeUndefined();
	});
});

// ─── wound() factory — expression damage ─────────────────────────────────────

describe('wound() factory — expression damage', () => {
	it('wound(scalarExpression) creates a WoundEffect with that expression as damage', () => {
		const effect = wound(distance);
		expect(effect).toBeInstanceOf(WoundEffect);
		expect(effect.damage).toBe(distance);
	});

	it('wound(scalarExpression) defaults causedByAttack to false', () => {
		expect(wound(distance).causedByAttack).toBe(false);
	});
});

// ─── wound() factory — props object ──────────────────────────────────────────

describe('wound() factory — props object', () => {
	it('wound({ damage }) accepts a numeric damage prop', () => {
		const effect = wound({ damage: 4 });
		expect(effect.damage).toBe(4);
	});

	it('wound({ damage }) accepts a scalar expression as damage', () => {
		const effect = wound({ damage: distance });
		expect(effect.damage).toBe(distance);
	});

	it('wound({ damage, causedByAttack: true }) sets causedByAttack', () => {
		const effect = wound({ damage: 2, causedByAttack: true });
		expect(effect.causedByAttack).toBe(true);
	});

	it('wound({ damage }) defaults causedByAttack to false', () => {
		const effect = wound({ damage: 2 });
		expect(effect.causedByAttack).toBe(false);
	});

	it('wound({ damage, target }) creates a WoundEffect with a Target', () => {
		const effect = wound({ damage: 1, target: { type: 'player' } });
		expect(effect.target).toBeInstanceOf(Target);
	});

	it('wound({ damage }) has no target by default', () => {
		const effect = wound({ damage: 1 });
		expect(effect.target).toBeUndefined();
	});
});

// ─── WoundEffect.apply ────────────────────────────────────────────────────────

// CharacterState.initial() gives health = 7 (STARTING_INDICATOR_VALUE).
// Use this when setting up players where the full health matters for defeat tests.

function makeWoundTestGraph(
	readonlyPlayer: ReadonlyPlayerState,
	mutableTarget: MutablePlayerState,
	damage: number
): GameGraph {
	const woundResolutionStack: MutableWoundResolution[] = [];
	const readonlyState = mock<ReadonlyGameState>({
		requireEntityState: (id) => (id === 'plr1' ? readonlyPlayer : undefined) as never,
		evaluate: (() => damage) as unknown as ReadonlyGameState['evaluate'],
		getActiveTestResolution: () => undefined
	});
	const mutableState = mock<MutableGameState>({
		woundResolutionStack,
		requireEntityState: (id) => (id === 'plr1' ? mutableTarget : undefined) as never,
		evaluate: (() => damage) as unknown as MutableGameState['evaluate'],
		requireActiveWoundResolution: () => woundResolutionStack[woundResolutionStack.length - 1]
	});
	const graph = mock<GameGraph>();
	Object.defineProperty(graph, 'current', {
		get: () => ({ state: readonlyState }),
		configurable: true
	});
	graph.requestTargets.mockResolvedValue(['plr1']);
	graph.mutate.mockImplementation((fn) => fn(mutableState));
	graph.triggerEvent.mockResolvedValue(undefined);
	graph.defeat.mockResolvedValue(undefined);
	return graph;
}

describe('WoundEffect.apply — basic damage', () => {
	it('adds finalDamage to physicalTrauma of the target', async () => {
		const { readonly, mutable } = makePlayer('plr1', 0);
		const graph = makeWoundTestGraph(readonly, mutable, 3);

		await wound(3).apply(graph);

		expect(mutable.physicalTrauma).toBe(3);
	});

	it('triggers the damageDealt event for the target', async () => {
		const { readonly, mutable } = makePlayer('plr1', 0);
		const graph = makeWoundTestGraph(readonly, mutable, 2);

		await wound(2).apply(graph);

		expect(graph.triggerEvent).toHaveBeenCalledWith('damageDealt', {
			subjectId: 'plr1',
			targetId: 'plr1'
		});
	});

	it('does not call defeat when remaining health is positive', async () => {
		const { readonly, mutable } = makePlayer('plr1', 0);
		const graph = makeWoundTestGraph(readonly, mutable, 3);

		await wound(3).apply(graph);

		expect(graph.defeat).not.toHaveBeenCalled();
	});

	it('calls defeat when remaining health reaches 0', async () => {
		// health = 7 (initial), physicalTrauma starts at 4, damage = 3; total = 7
		const { readonly, mutable } = makePlayer('plr1', 4);
		const graph = makeWoundTestGraph(readonly, mutable, 3);

		await wound(3).apply(graph);

		expect(graph.defeat).toHaveBeenCalledWith('plr1');
	});

	it('calls defeat when damage causes physicalTrauma to exceed health', async () => {
		// health = 7, physicalTrauma starts at 0, damage = 10; total = 10 > 7
		const { readonly, mutable } = makePlayer('plr1', 0);
		const graph = makeWoundTestGraph(readonly, mutable, 10);

		await wound(10).apply(graph);

		expect(graph.defeat).toHaveBeenCalledWith('plr1');
	});
});

describe('WoundEffect.apply — causedByAttack', () => {
	it('adds attack resolution damageModifier to the base damage', async () => {
		const { readonly, mutable } = makePlayer('plr1', 0);
		const woundResolutionStack: MutableWoundResolution[] = [];
		const attackRes = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'plr1',
			damageModifier: 2,
			negated: false
		});
		const readonlyState = mock<ReadonlyGameState>({
			requireEntityState: (id) => (id === 'plr1' ? readonly : undefined) as never,
			evaluate: (() => 3) as unknown as ReadonlyGameState['evaluate'],
			getActiveTestResolution: () => attackRes
		});
		const mutableState = mock<MutableGameState>({
			woundResolutionStack,
			requireEntityState: (id) => (id === 'plr1' ? mutable : undefined) as never,
			evaluate: (() => 3) as unknown as MutableGameState['evaluate'],
			requireActiveWoundResolution: () => woundResolutionStack[woundResolutionStack.length - 1]
		});
		const graph = mock<GameGraph>();
		Object.defineProperty(graph, 'current', {
			get: () => ({ state: readonlyState }),
			configurable: true
		});
		graph.requestTargets.mockResolvedValue(['plr1']);
		graph.mutate.mockImplementation((fn) => fn(mutableState));
		graph.triggerEvent.mockResolvedValue(undefined);
		graph.defeat.mockResolvedValue(undefined);

		await wound({ damage: 3, causedByAttack: true }).apply(graph);

		// base 3 + modifier 2 = 5
		expect(mutable.physicalTrauma).toBe(5);
	});

	it('applies 0 damage when the attack resolution is negated', async () => {
		const { readonly, mutable } = makePlayer('plr1', 0);
		const woundResolutionStack: MutableWoundResolution[] = [];
		const attackRes = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'plr1',
			damageModifier: 0,
			negated: true
		});
		const readonlyState = mock<ReadonlyGameState>({
			requireEntityState: (id) => (id === 'plr1' ? readonly : undefined) as never,
			evaluate: (() => 3) as unknown as ReadonlyGameState['evaluate'],
			getActiveTestResolution: () => attackRes
		});
		const mutableState = mock<MutableGameState>({
			woundResolutionStack,
			requireEntityState: (id) => (id === 'plr1' ? mutable : undefined) as never,
			evaluate: (() => 3) as unknown as MutableGameState['evaluate'],
			requireActiveWoundResolution: () => woundResolutionStack[woundResolutionStack.length - 1]
		});
		const graph = mock<GameGraph>();
		Object.defineProperty(graph, 'current', {
			get: () => ({ state: readonlyState }),
			configurable: true
		});
		graph.requestTargets.mockResolvedValue(['plr1']);
		graph.mutate.mockImplementation((fn) => fn(mutableState));
		graph.triggerEvent.mockResolvedValue(undefined);
		graph.defeat.mockResolvedValue(undefined);

		await wound({ damage: 3, causedByAttack: true }).apply(graph);

		expect(mutable.physicalTrauma).toBe(0);
	});
});
