import { Counter } from '@songsofdoom/common';
import { advanceTicks, mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Obligation, Opportunity } from '../capabilities/reaction';
import type { CharacterState } from '../characters';
import { Effect } from '../effects/effect';
import { events } from '../event';
import { Target, type TargetType } from '../target';
import type { MutableCardState, ReadonlyCardState } from './cardstate';
import { GameGraph, orderReactiveCapabilities, rollbackEffect } from './gamegraph';
import {
	CapabilityTriggered,
	DrawingFate,
	EffectGroup,
	EndEffectGroup,
	EndGroup,
	EventTriggered,
	FateDrawn,
	GameStart,
	InputReceived,
	InputRequested,
	Mutation,
	type EndGroupProps
} from './gamenodes';
import { ReadonlyGameState } from './gamestate';
import type { CardId } from './identifiers';
import { CapabilityChoiceField } from './playerinput';
import type { MutablePlayerState } from './playerstate';
import { ReadonlyPlayerState } from './playerstate';

// A minimal concrete Effect for use in triggerEffect tests
class NoopEffect extends Effect {
	async apply(): Promise<void> {}
}

function makeInitialState(players: ReadonlyPlayerState[] = []): ReadonlyGameState {
	return new ReadonlyGameState({ players });
}

function makePlayer(id: 'plr1' | 'plr2'): ReadonlyPlayerState {
	const player = mock<ReadonlyPlayerState>({ id });
	const mutablePlayer = mock<MutablePlayerState>({ id });
	player.cards.mockReturnValue([]);
	player.mutable.mockReturnValue(mutablePlayer);
	mutablePlayer.readonly.mockReturnValue(player);
	return player;
}

// ─── GameGraph construction ───────────────────────────────────────────────────

describe('GameGraph construction', () => {
	it('start is a GameStart node with id 0', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		expect(graph.start).toBeInstanceOf(GameStart);
		expect(graph.start.id).toBe(0);
	});

	it('current initially equals start', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		expect(graph.current).toBe(graph.start);
	});

	it('start holds the initial game state', () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		expect(graph.start.state.getPlayer('plr1')).toBeDefined();
	});
});

// ─── GameGraph.group / beginGroup / endGroup ──────────────────────────────────

describe('GameGraph.group', () => {
	it('adds the initial node before beginning the group', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(InputReceived, { values: {} }, {}, async () => {});
		expect(graph.start.next).toBeInstanceOf(InputReceived);
	});

	it('nodes inside the callback have the initial node as parent', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(InputReceived, { values: {} }, {}, async () => {
			await graph.triggerEffect(new NoopEffect());
		});
		const initialNode = graph.start.next!;
		const child = initialNode.next!;
		expect(child.parent).toBe(initialNode);
	});

	it('the initial node accumulates all children including EndGroup', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(InputReceived, { values: {} }, {}, async () => {
			await graph.triggerEffect(new NoopEffect());
			await graph.triggerEffect(new NoopEffect());
		});
		const initialNode = graph.start.next!;
		// Two EffectGroups + EndGroup = 3 children (EndEffectGroup is a child of its EffectGroup)
		expect(initialNode.children).toHaveLength(3);
		expect(initialNode.children[2]).toBeInstanceOf(EndGroup);
	});

	it('EndGroup carries the id of the initial node', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(InputReceived, { values: {} }, {}, async () => {});
		const initialNode = graph.start.next!;
		const endGroup = initialNode.children[0] as EndGroup;
		expect(endGroup.groupNodeId).toBe(initialNode.id);
	});

	it('nodes added after the group have no parent at root level', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(InputReceived, { values: {} }, {}, async () => {});
		await graph.triggerEffect(new NoopEffect());
		// current is EndEffectGroup whose parent is EffectGroup at the root (no parent)
		expect(graph.current.parent!.parent).toBeUndefined();
	});

	it('context ids are pushed onto their stacks in the initial node state', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(
			InputReceived,
			{ values: {} },
			{
				activeCardId: 'trt1',
				reactiveCardId: 'trt1',
				reactivePlayerId: 'plr1',
				targetId: 'trt1',
				subjectId: 'trt1'
			},
			async () => {}
		);
		const initialNode = graph.start.next!;
		expect(initialNode.state.activeCardStack).toContain('trt1');
		expect(initialNode.state.reactiveCardStack).toContain('trt1');
		expect(initialNode.state.reactivePlayerStack).toContain('plr1');
		expect(initialNode.state.targetStack).toContain('trt1');
		expect(initialNode.state.subjectStack).toContain('trt1');
	});

	it('EndGroup pops context ids from their stacks', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(
			InputReceived,
			{ values: {} },
			{
				activeCardId: 'trt1',
				reactiveCardId: 'trt1',
				reactivePlayerId: 'plr1',
				targetId: 'trt1',
				subjectId: 'trt1'
			},
			async () => {}
		);
		const initialNode = graph.start.next!;
		const endGroup = initialNode.children[0];
		expect(endGroup.state.activeCardStack).not.toContain('trt1');
		expect(endGroup.state.reactiveCardStack).not.toContain('trt1');
		expect(endGroup.state.reactivePlayerStack).not.toContain('plr1');
		expect(endGroup.state.targetStack).not.toContain('trt1');
		expect(endGroup.state.subjectStack).not.toContain('trt1');
	});

	it('returns the value from the callback', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const result = await graph.group(InputReceived, { values: {} }, {}, async () => 42);
		expect(result).toBe(42);
	});

	it('supports custom closing node props returned by closure', async () => {
		interface TaggedEndGroupProps extends EndGroupProps {
			tag: string;
		}

		class TaggedEndGroup extends EndGroup {
			readonly tag: string;

			constructor({ tag, ...baseProps }: TaggedEndGroupProps) {
				super(baseProps);
				this.tag = tag;
			}
		}

		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(
			InputReceived,
			{ values: {} },
			{
				closingNodeType: TaggedEndGroup,
				closure: () => ({ tag: 'custom-close' })
			},
			async () => {}
		);

		const initialNode = graph.start.next!;
		const closeNode = initialNode.children[0];
		expect(closeNode).toBeInstanceOf(TaggedEndGroup);
		expect((closeNode as TaggedEndGroup).tag).toBe('custom-close');
		expect((closeNode as TaggedEndGroup).groupNodeId).toBe(initialNode.id);
	});
});

// ─── GameGraph.test ───────────────────────────────────────────────────────────

describe('GameGraph.test', () => {
	it('uses FateDrawn as the closing node of DrawingFate groups', async () => {
		const p1 = makePlayer('plr1');
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const promise = graph.test({ subjectId: 'trt1', proficiency: 1 });
		await advanceTicks(1);
		await graph.supplyInput({ result: 2 });
		await promise;

		const drawingFateNode = graph.start.next;
		expect(drawingFateNode).toBeInstanceOf(DrawingFate);
		expect(drawingFateNode?.children.at(-1)).toBeInstanceOf(FateDrawn);
		expect((drawingFateNode?.children.at(-1) as FateDrawn).groupNodeId).toBe(drawingFateNode?.id);
	});

	it('runs test callbacks around fate events with subject and target context', async () => {
		const attacker = makePlayer('plr1');
		const defender = makePlayer('plr2');
		const graph = new GameGraph({ initialState: { players: [attacker, defender] } });
		const triggerEvent = graph.triggerEvent.bind(graph);
		const order: string[] = [];

		vi.spyOn(graph, 'triggerEvent').mockImplementation(async (eventType) => {
			order.push(eventType);
			await triggerEvent(eventType);
		});

		const promise = graph.test({
			subjectId: 'plr1',
			targetId: 'plr2',
			proficiency: 1,
			beforeTest: (innerGraph) => {
				order.push('beforeTest');
				expect(innerGraph.current.state.requireSubject().id).toBe('plr1');
				expect(innerGraph.current.state.requireTarget().id).toBe('plr2');
			},
			afterTest: (innerGraph) => {
				order.push('afterTest');
				expect(innerGraph.current.state.requireSubject().id).toBe('plr1');
				expect(innerGraph.current.state.requireTarget().id).toBe('plr2');
			}
		});

		await advanceTicks(1);
		await graph.supplyInput({ result: 2 });
		await promise;

		expect(order).toEqual([
			'beforeTest',
			'beforeDrawingFate',
			'fateTokenRevealed',
			'afterTest',
			'afterDrawingFate'
		]);
	});
});

// ─── GameGraph.triggerEffect ──────────────────────────────────────────────────

describe('GameGraph.triggerEffect', () => {
	it('adds an EffectGroup and EndEffectGroup node', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const effect = new NoopEffect();
		await graph.triggerEffect(effect);
		expect(graph.start.next).toBeInstanceOf(EffectGroup);
		expect(graph.current).toBeInstanceOf(EndEffectGroup);
	});

	it('stores the effect on EffectGroup', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const effect = new NoopEffect();
		await graph.triggerEffect(effect);
		expect((graph.start.next as EffectGroup).effect).toBe(effect);
	});

	it('records a Mutation node for each mutate() call', async () => {
		class MutatingEffect extends Effect {
			async apply(gameGraph: GameGraph): Promise<void> {
				gameGraph.mutate(() => {});
			}
		}
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.triggerEffect(new MutatingEffect());
		const effectGroup = graph.start.next!;
		expect(effectGroup.children[0]).toBeInstanceOf(Mutation);
	});

	it('rolls back entirely on rollbackEffect — no nodes added', async () => {
		class RollbackEffect extends Effect {
			async apply(): Promise<void> {
				rollbackEffect();
			}
		}
		const graph = new GameGraph({ initialState: { players: [] } });
		const before = graph.current;
		await graph.triggerEffect(new RollbackEffect());
		expect(graph.current).toBe(before);
	});
});

// ─── GameGraph.mutate ─────────────────────────────────────────────────────────

describe('GameGraph.mutate', () => {
	it('adds a Mutation node', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		graph.mutate(() => 42);
		expect(graph.current).toBeInstanceOf(Mutation);
	});

	it('stores the outcome on the Mutation node', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		graph.mutate(() => ({ value: 42 }));
		expect((graph.current as Mutation).outcome).toEqual({ value: 42 });
	});

	it('returns the outcome', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const result = graph.mutate(() => 'hello');
		expect(result).toBe('hello');
	});
});

// ─── GameGraph.requestInput / supplyInput ─────────────────────────────────────

describe('GameGraph.requestInput / supplyInput', () => {
	it('adds an InputRequested node with the provided fields', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestInput(target);
		expect(graph.current).toBeInstanceOf(InputRequested);
		expect((graph.current as InputRequested).playerId).toBe('plr1');
		// Resolve the promise so the test doesn't hang
		await graph.supplyInput({ target: [] });
		await promise;
	});

	it('addresses input to the active player when available', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({
			initialState: { players: [p1], activePlayerStack: ['plr1'] }
		});
		const target = new Target('player');
		const promise = graph.requestInput(target);
		expect((graph.current as InputRequested).playerId).toBe('plr1');
		await graph.supplyInput({ target: ['plr1'] });
		await promise;
	});

	it('supplyInput adds an InputReceived node', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestInput(target);
		await graph.supplyInput({ target: ['plr1'] });
		expect(graph.current).toBeInstanceOf(InputReceived);
		await promise;
	});

	it('the resolved value contains the supplied values', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestInput(target);
		await graph.supplyInput({ target: ['plr1'] });
		const result = await promise;
		expect(result).toEqual({ target: ['plr1'] });
	});
});

// ─── GameGraph.requestSingleTarget ───────────────────────────────────────────

describe('GameGraph.requestSingleTarget', () => {
	it('returns the provided default when target is undefined', async () => {
		const c1 = mock<ReadonlyCardState>({ id: 'trt1' });
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) });
		const graph = new GameGraph({
			initialState: { players: [p1], activeCardStack: ['trt1'] }
		});
		const result = await graph.requestSingleTarget(undefined, {
			default: 'active-card'
		});
		expect(result).toBe('trt1');
	});

	it('returns undefined when target is undefined and no default is provided', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const result = await graph.requestSingleTarget(undefined);
		expect(result).toBeUndefined();
	});

	it('requests input and returns the single selected target id', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestSingleTarget(target);
		await graph.supplyInput({ target: ['plr1'] });
		const result = await promise;
		expect(result).toBe('plr1');
	});

	it('throws when more than one target is selected', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestSingleTarget(target);
		await graph.supplyInput({ target: ['plr1', 'plr2'] });
		await expect(promise).rejects.toThrow();
	});
});

// ─── GameGraph.requestSinglePlayer ───────────────────────────────────────────

describe('GameGraph.requestSinglePlayer', () => {
	it('returns the provided default when target is undefined', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({
			initialState: { players: [p1], activePlayerStack: ['plr1'] }
		});
		const result = await graph.requestSinglePlayer(undefined, {
			default: 'active-player'
		});
		expect(result).toBe('plr1');
	});

	it('returns undefined when target is undefined and no default is provided', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const result = await graph.requestSinglePlayer(undefined);
		expect(result).toBeUndefined();
	});

	it('requests input and returns the single selected player id', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestSinglePlayer(target);
		await graph.supplyInput({ target: ['plr1'] });
		const result = await promise;
		expect(result).toBe('plr1');
	});

	it('throws when target is not a player target', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		await expect(graph.requestSinglePlayer(new Target('skill'))).rejects.toThrow(
			'Expected target to be of type player'
		);
	});
});

// ─── GameGraph.requestTargets ────────────────────────────────────────────────

describe('GameGraph.requestTargets', () => {
	it('returns the provided default when target is undefined', async () => {
		const c1 = mock<ReadonlyCardState>({ id: 'trt1' });
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'trt1' ? c1 : undefined) });
		const graph = new GameGraph({
			initialState: { players: [p1], targetStack: ['trt1'] }
		});
		const result = await graph.requestTargets(undefined, {
			default: 'current-target'
		});
		expect(result).toEqual(['trt1']);
	});

	it('returns an empty array when target is undefined and no default is provided', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const result = await graph.requestTargets(undefined);
		expect(result).toEqual([]);
	});

	it('requests input and returns selected target ids', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestTargets(target);
		await graph.supplyInput({ target: ['plr1', 'plr2'] });
		const result = await promise;
		expect(result).toEqual(['plr1', 'plr2']);
	});
});

// ─── GameGraph.requestPlayers ────────────────────────────────────────────────

describe('GameGraph.requestPlayers', () => {
	const nonPlayerTargetTypes: Array<Exclude<TargetType, 'player'>> = [
		'owner',
		'active-player',
		'attacker',
		'defender',
		'enemy',
		'ally',
		'object',
		'location',
		'skill'
	];

	it('returns the provided default when target is undefined', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({
			initialState: { players: [p1], activePlayerStack: ['plr1'] }
		});
		const result = await graph.requestPlayers(undefined, {
			default: 'active-player'
		});
		expect(result).toEqual(['plr1']);
	});

	it('returns an empty array when target is undefined and no default is provided', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const result = await graph.requestPlayers(undefined);
		expect(result).toEqual([]);
	});

	it('requests input and returns selected player ids when target is a player target', async () => {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const target = new Target('player');
		const promise = graph.requestPlayers(target);
		await graph.supplyInput({ target: ['plr1', 'plr2'] });
		const result = await promise;
		expect(result).toEqual(['plr1', 'plr2']);
	});

	it.each(nonPlayerTargetTypes)('throws when target type is %s', async (targetType) => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await expect(graph.requestPlayers(new Target(targetType))).rejects.toThrow(
			'Expected target to be of type player'
		);
	});
});

// ─── GameGraph.triggerEvent ─────────────────────────────────────────────────

describe('GameGraph.triggerEvent', () => {
	it('adds an EventTriggered node even when no ready card has reactions', async () => {
		const card = mock<ReadonlyCardState>({ getReactionsToEvent: () => [] });
		const p1 = mock<ReadonlyPlayerState>({ cards: () => [card] });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		await graph.triggerEvent('attack');
		expect(graph.start.next).toBeInstanceOf(EventTriggered);
	});

	it('adds an EventTriggered node when there are no ready cards', async () => {
		const p1 = mock<ReadonlyPlayerState>({ cards: () => [] });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		await graph.triggerEvent('attack');
		expect(graph.start.next).toBeInstanceOf(EventTriggered);
	});

	it('adds an EventTriggered node when a ready card has matching reactions', async () => {
		const reaction = mock<Opportunity>();
		const card = mock<ReadonlyCardState>({
			id: 'trt1',
			getReactionsToEvent: () => [reaction]
		});
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1', cards: () => [card] });
		const graph = new GameGraph({ initialState: { players: [p1] } });

		const eventPromise = graph.triggerEvent('attack');

		// Expect EventTriggered node has been added synchronously
		const eventNode = graph.start.next!;
		expect(eventNode).toBeInstanceOf(EventTriggered);
		expect((eventNode as EventTriggered).event).toBe(events['attack']);

		await advanceTicks(3);
		await graph.supplyInput({ selection: { cardId: 'trt1', capability: reaction } });
		await eventPromise;
	});

	it('stores the correct event on the EventTriggered node', async () => {
		const reaction = mock<Opportunity>();
		const card = mock<ReadonlyCardState>({
			id: 'trt1',
			getReactionsToEvent: () => [reaction]
		});
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1', cards: () => [card] });
		const graph = new GameGraph({ initialState: { players: [p1] } });

		const eventPromise = graph.triggerEvent('investigation');
		const eventNode = graph.start.next as EventTriggered;
		expect(eventNode.event).toBe(events['investigation']);

		await advanceTicks(3);
		await graph.supplyInput({ selection: { cardId: 'trt1', capability: reaction } });
		await eventPromise;
	});
});

// ─── GameGraph.triggerEvent – iterative input ───────────────────────────────

describe('orderReactiveCapabilities', () => {
	it('groups by reactionOrder and then by owner in clockwise order', () => {
		const p1Order1 = {
			cardId: 'trt1',
			reactionOrder: 1,
			ownerId: 'plr1',
			capability: mock<Opportunity>()
		};
		const p2Order1 = {
			cardId: 'trt2',
			reactionOrder: 1,
			ownerId: 'plr2',
			capability: mock<Opportunity>()
		};
		const p1Order2 = {
			cardId: 'trt3',
			reactionOrder: 2,
			ownerId: 'plr1',
			capability: mock<Opportunity>()
		};

		const groups = orderReactiveCapabilities([p1Order2, p2Order1, p1Order1] as never, 'plr1', [
			'plr1',
			'plr2'
		]);

		expect(groups.map((group) => group.reactions.map((reaction) => reaction.cardId))).toEqual([
			['trt1'],
			['trt2'],
			['trt3']
		]);
		expect(groups.map((group) => group.decidingPlayerId)).toEqual(['plr1', 'plr2', 'plr1']);
	});

	it('assigns ownerless reactions to current player decisions before owned ties', () => {
		const ownerlessOrder1 = {
			cardId: 'trt4',
			reactionOrder: 1,
			ownerId: undefined,
			capability: mock<Obligation>()
		};
		const p2Order1 = {
			cardId: 'trt5',
			reactionOrder: 1,
			ownerId: 'plr2',
			capability: mock<Opportunity>()
		};

		const groups = orderReactiveCapabilities([ownerlessOrder1, p2Order1] as never, 'plr1', [
			'plr1',
			'plr2'
		]);

		expect(groups.map((group) => group.reactions.map((reaction) => reaction.cardId))).toEqual([
			['trt4'],
			['trt5']
		]);
		expect(groups.map((group) => group.decidingPlayerId)).toEqual(['plr1', 'plr2']);
	});
});

describe('GameGraph.triggerEvent - iterative input', () => {
	function mockCardWithReaction(
		id: CardId,
		reaction: Obligation | Opportunity,
		ownerId: 'plr1' | 'plr2' = 'plr1'
	): ReadonlyCardState {
		return mock<ReadonlyCardState>({ id, ownerId, getReactionsToEvent: () => [reaction] });
	}

	function graphWithReactions(cards: ReadonlyCardState[]) {
		const p1 = mock<ReadonlyPlayerState>({ id: 'plr1', cards: () => cards });
		const mutablePlayer = mock<MutablePlayerState>({
			id: 'plr1',
			getCard: () => mock<MutableCardState>()
		});
		mutablePlayer.readonly.mockReturnValue(p1);
		p1.mutable.mockReturnValue(mutablePlayer);
		return new GameGraph({ initialState: { players: [p1] } });
	}

	function currentChoiceField(graph: GameGraph): CapabilityChoiceField {
		return (graph.current as InputRequested).fields[0] as CapabilityChoiceField;
	}

	it('auto-triggers obligations without requesting input', async () => {
		const reaction = new Obligation({ effects: [], triggers: ['attack'] });
		const triggerSpy = vi.spyOn(reaction, 'trigger').mockResolvedValue();
		const card = mockCardWithReaction('trt1', reaction);
		const graph = graphWithReactions([card]);

		await graph.triggerEvent('attack');
		expect(triggerSpy).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'trt1' }));
		expect(graph.current).not.toBeInstanceOf(InputRequested);
	});

	it('required is true when user ordering is needed', async () => {
		const reaction = mock<Opportunity>();
		const card = mockCardWithReaction('trt1', reaction);
		const graph = graphWithReactions([card]);

		const eventPromise = graph.triggerEvent('attack');
		expect(currentChoiceField(graph).required).toBe(true);

		const [choice] = currentChoiceField(graph).choices;
		await graph.supplyInput({ selection: choice });
		await eventPromise;
	});

	it('selecting a reaction calls trigger on the capability', async () => {
		const reaction = mock<Opportunity>();
		const card = mockCardWithReaction('trt1', reaction);
		const graph = graphWithReactions([card]);

		const eventPromise = graph.triggerEvent('attack');
		const [choice] = currentChoiceField(graph).choices;
		await graph.supplyInput({ selection: choice });
		await eventPromise;

		expect(reaction.trigger).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'trt1' }));
	});

	it('selecting a reaction removes it from the choices and loops for the next', async () => {
		const reaction1 = mock<Opportunity>();
		const reaction2 = mock<Opportunity>();
		const card1 = mockCardWithReaction('trt1', reaction1);
		const card2 = mockCardWithReaction('trt2', reaction2);
		const graph = graphWithReactions([card1, card2]);

		const eventPromise = graph.triggerEvent('attack');

		// First request: both reactions available
		const allChoices = [...currentChoiceField(graph).choices];
		expect(allChoices).toMatchObject([
			{ cardId: 'trt1', capability: reaction1 },
			{ cardId: 'trt2', capability: reaction2 }
		]);
		await graph.supplyInput({ selection: allChoices[0] });
		await advanceTicks(3); // let graph advance past trigger to next InputRequested

		// Second request: only one reaction remains
		expect([...currentChoiceField(graph).choices]).toMatchObject([
			{ cardId: 'trt2', capability: reaction2 }
		]);
		await graph.supplyInput({ selection: allChoices[1] });

		await eventPromise;
		expect(reaction1.trigger).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'trt1' }));
		expect(reaction2.trigger).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'trt2' }));
	});

	it('asks for user order when obligation and opportunity coexist', async () => {
		const obligation = new Obligation({ effects: [], triggers: ['attack'] });
		const obligationTriggerSpy = vi.spyOn(obligation, 'trigger').mockResolvedValue();
		const opportunity = mock<Opportunity>();
		const card1 = mockCardWithReaction('trt1', obligation);
		const card2 = mockCardWithReaction('trt2', opportunity);
		const graph = graphWithReactions([card1, card2]);

		const eventPromise = graph.triggerEvent('attack');
		await advanceTicks(2);

		expect(obligationTriggerSpy).not.toHaveBeenCalled();
		const choices = [...currentChoiceField(graph).choices];
		expect(choices).toMatchObject([
			{ cardId: 'trt1', capability: obligation },
			{ cardId: 'trt2', capability: opportunity }
		]);

		await graph.supplyInput({ selection: choices[1] });
		await advanceTicks(2);

		expect(opportunity.trigger).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'trt2' }));
		expect(obligationTriggerSpy).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'trt1' }));
		await eventPromise;
	});

	it('throws when no reaction is selected while ordering is required', async () => {
		const reaction1 = mock<Opportunity>();
		const reaction2 = mock<Opportunity>();
		const card1 = mockCardWithReaction('trt1', reaction1);
		const card2 = mockCardWithReaction('trt2', reaction2);
		const graph = graphWithReactions([card1, card2]);

		const eventPromise = graph.triggerEvent('attack');
		await graph.supplyInput({ selection: undefined });

		await expect(eventPromise).rejects.toThrow(
			'Reaction selection is required when multiple reactions are available'
		);
		expect(reaction1.trigger).not.toHaveBeenCalled();
		expect(reaction2.trigger).not.toHaveBeenCalled();
	});
});

// ─── rollbackEffect ───────────────────────────────────────────────────────────

describe('rollbackEffect', () => {
	it('throws when called', () => {
		expect(() => rollbackEffect()).toThrow();
	});
});

// ─── GameNode types ───────────────────────────────────────────────────────────

describe('GameNode types', () => {
	const state = makeInitialState();

	it('CapabilityTriggered stores capability and cardId', () => {
		const capability = new Obligation({ effects: [], triggers: ['attack'] });
		const node = new CapabilityTriggered({ id: 1, state, capability, cardId: 'trt1' });
		expect(node.capability).toBe(capability);
		expect(node.cardId).toBe('trt1');
	});

	it('EndGroup stores the groupNodeId', () => {
		const node = new EndGroup({ id: 2, state, groupNodeId: 1 });
		expect(node.groupNodeId).toBe(1);
	});

	it('EventTriggered stores the event', () => {
		const node = new EventTriggered({ id: 1, state, event: events['attack'] });
		expect(node.event).toBe(events['attack']);
	});

	it('InputRequested stores fields', () => {
		const target = new Target('player');
		const field = {
			name: 'target',
			required: true,
			target
		} as unknown as InputRequested['fields'][number];
		const node = new InputRequested({ id: 1, state, playerId: 'plr1', fields: [field] });
		expect(node.playerId).toBe('plr1');
		expect(node.fields).toEqual([field]);
	});

	it('InputReceived stores values', () => {
		const node = new InputReceived({ id: 1, state, values: { x: 42 } });
		expect(node.values).toEqual({ x: 42 });
	});

	it('GameNode.children is initially empty', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		expect(graph.start.children).toEqual([]);
	});

	it('GameNode.next is initially undefined', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		expect(graph.start.next).toBeUndefined();
	});
});

// ─── GameGraph.defeat ─────────────────────────────────────────────────────────

describe('GameGraph.defeat', () => {
	function makeRealPlayer(id: 'plr1' | 'plr2'): ReadonlyPlayerState {
		return new ReadonlyPlayerState({
			id,
			character: mock<CharacterState>(),
			deck: [],
			hand: [],
			discardPile: [],
			focusesBag: new Counter(),
			focusesDiscardPile: new Counter(),
			focusesHand: new Counter(),
			physicalTrauma: 0,
			mentalTrauma: 0
		});
	}

	it('sets defeated to true on the player state', async () => {
		const player = makeRealPlayer('plr1');
		const graph = new GameGraph({ initialState: { players: [player] } });
		await graph.defeat('plr1');
		expect(graph.current.state.requirePlayer('plr1').defeated).toBe(true);
	});

	it('accepts a PlayerState instead of a PlayerId', async () => {
		const player = makeRealPlayer('plr1');
		const graph = new GameGraph({ initialState: { players: [player] } });
		await graph.defeat(player);
		expect(graph.current.state.requirePlayer('plr1').defeated).toBe(true);
	});

	it('emits a playerDefeated EventTriggered node', async () => {
		const player = makeRealPlayer('plr1');
		const graph = new GameGraph({ initialState: { players: [player] } });
		await graph.defeat('plr1');
		const mutationNode = graph.start.next!;
		const eventNode = mutationNode.next!;
		expect(eventNode).toBeInstanceOf(EventTriggered);
		expect((eventNode as EventTriggered).event).toBe(events['playerDefeated']);
	});

	it('sets the player as the subject of the playerDefeated event', async () => {
		const player = makeRealPlayer('plr1');
		const graph = new GameGraph({ initialState: { players: [player] } });
		await graph.defeat('plr1');
		const mutationNode = graph.start.next!;
		const eventNode = mutationNode.next!;
		expect(eventNode.state.getSubject()?.id).toBe('plr1');
	});
});
