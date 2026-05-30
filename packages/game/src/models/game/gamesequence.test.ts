import { Counter } from '@songsofdoom/common';
import { mock } from '@songsofdoom/common/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Action } from '../capabilities/action';
import { DrawFocusEffect } from '../effects';
import type { Entity } from '../entities';
import { events } from '../event';
import type { FocusToken } from '../focus';
import type { EntityType } from '../properties';
import { ReadonlyCardState } from './cardstate';
import * as chooseActionModule from './enemyactions';
import { GameGraph } from './gamegraph';
import {
	CapabilityTriggered,
	ChapterPhaseNode,
	EffectGroup,
	EventTriggered,
	GameNode,
	PlayerFocusNode,
	TurnPhaseNode
} from './gamenodes';
import {
	runChapter,
	runEnemyPlanning,
	runExecution,
	runFocusPhase,
	runPlayerPlanning,
	runTurn,
	runTurnsPhase,
	type PlannedAction
} from './gamesequence';
import type { CardId, LocationId, PlayerId } from './identifiers';
import { ReadonlyLocationState } from './locationstate';
import type { MutablePlayerState, ReadonlyPlayerState } from './playerstate';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeCard(id: CardId, ownerId: 'plr1' | 'plr2' | 'plr3'): ReadonlyCardState {
	const entity = mock<Entity>({ capabilities: [], attachmentCapabilities: [], properties: [] });
	return new ReadonlyCardState({
		id,
		card: entity,
		ownerId,
		container: { type: 'location', locationId: 'loc1' as LocationId }
	});
}

function makeTestLocation(id: LocationId, cards: ReadonlyCardState[]): ReadonlyLocationState {
	return new ReadonlyLocationState({
		id,
		card: mock<Entity>({ properties: [] }),
		ownerId: 'plr1',
		container: { type: 'location', locationId: id },
		attachments: cards
	});
}

function makePlayer(
	id: PlayerId,
	{ defeated = false }: { defeated?: boolean } = {}
): ReadonlyPlayerState {
	const emptyHand = new Counter<FocusToken>();
	const emptyMutableHand = new Counter<FocusToken>();
	const player = mock<ReadonlyPlayerState>({
		id,
		hand: [],
		attachments: [],
		defeated,
		focusesHand: emptyHand
	});
	const mutablePlayer = mock<MutablePlayerState>({
		id,
		focusesHand: emptyMutableHand
	});
	player.cards.mockReturnValue([]);
	player.mutable.mockReturnValue(mutablePlayer);
	mutablePlayer.readonly.mockReturnValue(player);
	return player;
}

function makeCreatureCard(id: CardId, ownerId: PlayerId): ReadonlyCardState {
	const entity = mock<Entity>({
		type: { id: 'creature' } as EntityType,
		properties: []
	});
	return new ReadonlyCardState({
		id,
		card: entity,
		ownerId,
		container: { type: 'location', locationId: 'loc1' as LocationId }
	});
}

function makeGraph(players: ReadonlyPlayerState[] = []): GameGraph {
	return new GameGraph({ initialState: { players } });
}

/** Collects all nodes (excluding GameStart) in linear sequence from graph.start.next. */
function collectNodes<T extends GameNode>(
	graph: GameGraph,
	ctor: abstract new (...args: never[]) => T
): T[] {
	const result: T[] = [];
	let node: GameNode | undefined = graph.start.next;
	while (node) {
		if (node instanceof ctor) result.push(node);
		node = node.next;
	}
	return result;
}

// ─── runChapter ───────────────────────────────────────────────────────────────

describe('runChapter', () => {
	it('creates a ChapterPhaseNode for each of the six phases in order', async () => {
		const graph = makeGraph();

		await runChapter(graph);

		const phaseNodes = collectNodes(graph, ChapterPhaseNode);
		expect(phaseNodes.map((n) => n.phase)).toEqual([
			'chapter-start',
			'focus',
			'turns',
			'draw',
			'encounters',
			'cleanup'
		]);
	});

	it('triggers a chapterStart event inside the chapter-start phase', async () => {
		const graph = makeGraph();

		await runChapter(graph);

		const chapterStartNode = collectNodes(graph, ChapterPhaseNode).find(
			(n) => n.phase === 'chapter-start'
		)!;
		const eventsInPhase = chapterStartNode.children.filter(
			(n): n is EventTriggered => n instanceof EventTriggered
		);
		expect(eventsInPhase.some((n) => n.event === events.chapterStart)).toBe(true);
	});

	it('triggers a chapterEnd event inside the cleanup phase', async () => {
		const graph = makeGraph();

		await runChapter(graph);

		const cleanupNode = collectNodes(graph, ChapterPhaseNode).find((n) => n.phase === 'cleanup')!;
		const eventsInPhase = cleanupNode.children.filter(
			(n): n is EventTriggered => n instanceof EventTriggered
		);
		expect(eventsInPhase.some((n) => n.event === events.chapterEnd)).toBe(true);
	});

	it('runs drawCards(1) for each player in the draw phase', async () => {
		const p1 = makePlayer('plr1');
		const p2 = makePlayer('plr2');
		const graph = makeGraph([p1, p2]);

		await runChapter(graph);

		const drawPhaseNode = collectNodes(graph, ChapterPhaseNode).find((n) => n.phase === 'draw')!;
		// One DrawCards effect group per player
		const drawEffectGroups = drawPhaseNode.children.filter((n) => n instanceof EffectGroup);
		expect(drawEffectGroups).toHaveLength(2);
	});
});

// ─── runFocusPhase ────────────────────────────────────────────────────────────

describe('runFocusPhase', () => {
	it('skips defeated players', async () => {
		const p1 = makePlayer('plr1');
		const p2 = makePlayer('plr2', { defeated: true });
		const graph = makeGraph([p1, p2]);

		await runFocusPhase(graph);

		const playerFocusNodes = collectNodes(graph, PlayerFocusNode);
		expect(playerFocusNodes).toHaveLength(1);
	});

	it('creates a node for each player', async () => {
		const p1 = makePlayer('plr1');
		const p2 = makePlayer('plr2');
		const graph = makeGraph([p1, p2]);

		await runFocusPhase(graph);

		const playerFocusNodes = collectNodes(graph, PlayerFocusNode);
		expect(playerFocusNodes[0].state.activePlayerStack).toContain('plr1');
		expect(playerFocusNodes[1].state.activePlayerStack).toContain('plr2');
	});

	it('triggers a drawFocus(5) effect inside each PlayerFocusNode', async () => {
		const p1 = makePlayer('plr1');
		const graph = makeGraph([p1]);

		await runFocusPhase(graph);

		const playerFocusNode = collectNodes(graph, PlayerFocusNode)[0];
		const effectGroup = playerFocusNode.children.find(
			(n): n is EffectGroup => n instanceof EffectGroup
		);
		expect(effectGroup).toBeDefined();
		expect(effectGroup!.effect).toBeInstanceOf(DrawFocusEffect);
		expect((effectGroup!.effect as DrawFocusEffect).amount).toBe(5);
	});
});

// ─── runTurnsPhase ────────────────────────────────────────────────────────────

describe('runTurnsPhase', () => {
	it('stops after a single turn when no entity acts', async () => {
		const graph = makeGraph([makePlayer('plr1')]);
		const singleTurnRunner = vi.fn().mockResolvedValue(false);

		await runTurnsPhase(graph, singleTurnRunner);

		expect(singleTurnRunner).toHaveBeenCalledTimes(1);
		expect(singleTurnRunner).toHaveBeenCalledWith(graph);
	});

	it('continues running turns while at least one entity acts', async () => {
		const graph = makeGraph([makePlayer('plr1')]);
		const singleTurnRunner = vi
			.fn()
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(false);

		await runTurnsPhase(graph, singleTurnRunner);

		expect(singleTurnRunner).toHaveBeenCalledTimes(3);
	});
});

// ─── runTurn ─────────────────────────────────────────────────────────────────

describe('runTurn', () => {
	it('wraps turn-start in a TurnPhaseNode', async () => {
		const graph = makeGraph([makePlayer('plr1')]);

		await runTurn(graph);

		const turnStartNode = collectNodes(graph, TurnPhaseNode).find((n) => n.phase === 'turn-start');
		expect(turnStartNode).toBeDefined();
	});

	it('triggers a turnStart event in the turn-start phase', async () => {
		const graph = makeGraph([makePlayer('plr1')]);

		await runTurn(graph);

		const turnStartNode = collectNodes(graph, TurnPhaseNode).find((n) => n.phase === 'turn-start')!;
		const eventNodes = turnStartNode.children.filter(
			(n): n is EventTriggered => n instanceof EventTriggered
		);
		expect(eventNodes.some((n) => n.event === events.turnStart)).toBe(true);
	});

	it('triggers a turnEnd event in the turn-end phase', async () => {
		const graph = makeGraph([makePlayer('plr1')]);

		await runTurn(graph);

		const turnEndNode = collectNodes(graph, TurnPhaseNode).find((n) => n.phase === 'turn-end')!;
		const eventNodes = turnEndNode.children.filter(
			(n): n is EventTriggered => n instanceof EventTriggered
		);
		expect(eventNodes.some((n) => n.event === events.turnEnd)).toBe(true);
	});

	it('returns false when no entity planned an action', async () => {
		const graph = makeGraph([makePlayer('plr1')]);

		const acted = await runTurn(graph);

		expect(acted).toBe(false);
	});
});

// ─── runEnemyPlanning ─────────────────────────────────────────────────────────

describe('runEnemyPlanning', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('does nothing when there are no creatures in play', async () => {
		const p1 = makePlayer('plr1');
		const graph = new GameGraph({
			initialState: { players: [p1], locations: [] }
		});

		await runEnemyPlanning(graph);

		expect(graph.current.state.plannedActions.size).toBe(0);
	});

	it('records a planned action when chooseEnemyAction returns one', async () => {
		const p1 = makePlayer('plr1');
		const action = new Action({ effects: [] });
		const plannedAction: PlannedAction = {
			cardId: 'crt1' as CardId,
			action,
			initiative: 5
		};
		const spy = vi.spyOn(chooseActionModule, 'chooseEnemyAction').mockReturnValue(plannedAction);
		const creature = makeCreatureCard('crt1' as CardId, 'plr1');
		const location = makeTestLocation('loc1' as LocationId, [creature]);
		const graph = new GameGraph({
			initialState: { players: [p1], locations: [location] }
		});

		await runEnemyPlanning(graph);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(graph.current.state.plannedActions.size).toBe(1);
		expect(graph.current.state.plannedActions.get('crt1' as CardId)).toBe(plannedAction);
	});

	it('records actions for each creature', async () => {
		const p1 = makePlayer('plr1');
		const plannedAction1: PlannedAction = {
			cardId: 'crt1' as CardId,
			action: new Action({ effects: [] }),
			initiative: 3
		};
		const plannedAction2: PlannedAction = {
			cardId: 'crt2' as CardId,
			action: new Action({ effects: [] }),
			initiative: 7
		};
		const spy = vi
			.spyOn(chooseActionModule, 'chooseEnemyAction')
			.mockReturnValueOnce(plannedAction1)
			.mockReturnValueOnce(plannedAction2);
		const creature1 = makeCreatureCard('crt1' as CardId, 'plr1');
		const creature2 = makeCreatureCard('crt2' as CardId, 'plr1');
		const location = makeTestLocation('loc1' as LocationId, [creature1, creature2]);
		const graph = new GameGraph({
			initialState: { players: [p1], locations: [location] }
		});

		await runEnemyPlanning(graph);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(graph.current.state.plannedActions.size).toBe(2);
		expect(graph.current.state.plannedActions.get('crt1' as CardId)).toBe(plannedAction1);
		expect(graph.current.state.plannedActions.get('crt2' as CardId)).toBe(plannedAction2);
	});

	it('skips creatures for which chooseEnemyAction returns null', async () => {
		const p1 = makePlayer('plr1');
		const plannedAction: PlannedAction = {
			cardId: 'crt1' as CardId,
			action: new Action({ effects: [] }),
			initiative: 5
		};
		const spy = vi
			.spyOn(chooseActionModule, 'chooseEnemyAction')
			.mockReturnValueOnce(plannedAction)
			.mockReturnValueOnce(undefined);
		const creature1 = makeCreatureCard('crt1' as CardId, 'plr1');
		const creature2 = makeCreatureCard('crt2' as CardId, 'plr1');
		const location = makeTestLocation('loc1' as LocationId, [creature1, creature2]);
		const graph = new GameGraph({
			initialState: { players: [p1], locations: [location] }
		});

		await runEnemyPlanning(graph);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(graph.current.state.plannedActions.size).toBe(1);
		expect(graph.current.state.plannedActions.get('crt1' as CardId)).toBe(plannedAction);
		expect(graph.current.state.plannedActions.has('crt2' as CardId)).toBe(false);
	});
});

// ─── runExecution ─────────────────────────────────────────────────────────────

describe('runExecution', () => {
	it('clears plannedActions from game state after execution', async () => {
		const p1 = makePlayer('plr1');
		const action = new Action({ effects: [] });
		const card = makeCard('crt1' as CardId, 'plr1');
		const location = makeTestLocation('loc1' as LocationId, [card]);
		const graph = new GameGraph({
			initialState: {
				players: [p1],
				locations: [location],
				plannedActions: new Map([['crt1', { cardId: 'crt1' as CardId, action, initiative: 5 }]])
			}
		});

		await runExecution(graph);

		expect(graph.current.state.plannedActions.size).toBe(0);
	});

	it('triggers actions in descending order of initiative', async () => {
		const p1 = makePlayer('plr1');
		const action1 = new Action({ effects: [] });
		const action2 = new Action({ effects: [] });
		const card1 = makeCard('crt1' as CardId, 'plr1');
		const card2 = makeCard('crt2' as CardId, 'plr1');
		const location = makeTestLocation('loc1' as LocationId, [card1, card2]);
		const graph = new GameGraph({
			initialState: {
				players: [p1],
				locations: [location],
				plannedActions: new Map([
					['crt1', { cardId: 'crt1' as CardId, action: action1, initiative: 3 }],
					['crt2', { cardId: 'crt2' as CardId, action: action2, initiative: 7 }]
				])
			}
		});

		await runExecution(graph);

		// crt2 acted first (higher initiative 7 > 3), so its CapabilityTriggered node comes first
		const capNodes = collectNodes(graph, CapabilityTriggered);
		expect(capNodes[0].cardId).toBe('crt2');
	});
});

// ─── runPlayerPlanning ────────────────────────────────────────────────────────

describe('runPlayerPlanning', () => {
	it('requests input for each non-defeated player', async () => {
		const p1 = makePlayer('plr1');
		const p2 = makePlayer('plr2');
		const graph = makeGraph([p1, p2]);

		// runPlayerPlanning will suspend waiting for input; we don't await here — see below
		const planningPromise = runPlayerPlanning(graph);

		// Supply input for plr1 (choosing to pass — no action chosen)
		await graph.supplyInput({ action: undefined });
		// Supply input for plr2
		await graph.supplyInput({ action: undefined });

		await planningPromise;

		// Both players were asked; two InputRequested nodes
		const { InputRequested } = await import('./gamenodes');
		const inputNodes = collectNodes(graph, InputRequested);
		expect(inputNodes).toHaveLength(2);
	});
});
