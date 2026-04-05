import { advanceTicks, mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Obligation, Opportunity } from '../capabilities/reaction';
import { Effect } from '../effects/effect';
import { events } from '../event';
import { Target } from '../target';
import type { MutableCardState, ReadonlyCardState } from './cardstate';
import {
	CapabilityFinished,
	CapabilityTriggered,
	EffectTriggered,
	EventTriggered,
	GameGraph,
	GameStart,
	InputReceived,
	InputRequested,
	cancelMutation
} from './gamegraph';
import { ReadonlyGameState } from './gamestate';
import type { CardId } from './identifiers';
import { CapabilityChoiceField } from './playerinput';
import type { MutablePlayerState } from './playerstate';
import { ReadonlyPlayerState } from './playerstate';

// A minimal concrete Effect for use in effectTriggered tests
class NoopEffect extends Effect {
	async trigger(): Promise<void> {}
}

function makeInitialState(players: ReadonlyPlayerState[] = []): ReadonlyGameState {
	return new ReadonlyGameState({ players });
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
		const p1 = mock<ReadonlyPlayerState>({ id: 'p1' });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		expect(graph.start.state.getPlayer('p1')).toBeDefined();
	});
});

// ─── GameGraph.add ────────────────────────────────────────────────────────────

describe('GameGraph.add', () => {
	it('advances current to the new node', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const before = graph.current;
		graph.add(InputReceived, { values: {} });
		expect(graph.current).not.toBe(before);
		expect(graph.current).toBeInstanceOf(InputReceived);
	});

	it('increments node id by 1', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		graph.add(InputReceived, { values: {} });
		expect(graph.current.id).toBe(1);
		graph.add(InputReceived, { values: {} });
		expect(graph.current.id).toBe(2);
	});

	it('links previous.next to the new node', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const prev = graph.current;
		graph.add(InputReceived, { values: {} });
		expect(prev.next).toBe(graph.current);
	});

	it('sets previous on the new node', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const prev = graph.current;
		graph.add(InputReceived, { values: {} });
		expect(graph.current.previous).toBe(prev);
	});

	it('calls onChange after adding a node', () => {
		const onChange = vi.fn();
		const graph = new GameGraph({ initialState: { players: [] }, onChange });
		graph.add(InputReceived, { values: {} });
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it('carries forward the current state when no state is provided', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const initialState = graph.current.state;
		graph.add(InputReceived, { values: {} });
		expect(graph.current.state).toBe(initialState);
	});

	it('uses a ReadonlyGameState directly when provided', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const newState = new ReadonlyGameState({ players: [] });
		graph.add(InputReceived, { values: {}, state: newState });
		expect(graph.current.state).toBe(newState);
	});

	it('applies a state mutation function', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		graph.add(InputReceived, {
			values: {},
			state: (s) => {
				s.activePlayerStack.push('p1');
			}
		});
		expect(graph.current.state.activePlayerStack).toContain('p1');
	});

	it('does not add a node when the mutation calls cancelMutation', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const before = graph.current;
		graph.add(InputReceived, {
			values: {},
			state: () => cancelMutation()
		});
		expect(graph.current).toBe(before);
	});
});

// ─── GameGraph.group / beginGroup / endGroup ──────────────────────────────────

describe('GameGraph.group', () => {
	it('nodes inside the group have the pre-group current as parent', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const groupParent = graph.current;
		await graph.group(async () => {
			graph.add(InputReceived, { values: {} });
		});
		const child = groupParent.next!;
		expect(child.parent).toBe(groupParent);
	});

	it('the parent node accumulates child nodes', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const groupParent = graph.current;
		await graph.group(async () => {
			graph.add(InputReceived, { values: { a: 1 } });
			graph.add(InputReceived, { values: { b: 2 } });
		});
		const firstChild = groupParent.next!;
		const secondChild = firstChild.next!;
		expect(groupParent.children).toEqual([firstChild, secondChild]);
	});

	it('nodes added after the group have no parent at root level', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		await graph.group(async () => {
			graph.add(InputReceived, { values: {} });
		});
		graph.add(InputReceived, { values: {} });
		expect(graph.current.parent).toBeUndefined();
	});

	it('endGroup without beginGroup throws', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		expect(() => graph.endGroup()).toThrow();
	});
});

// ─── GameGraph.effectTriggered ────────────────────────────────────────────────

describe('GameGraph.effectTriggered', () => {
	it('adds an EffectTriggered node', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const effect = new NoopEffect();
		graph.effectTriggered(effect, () => undefined);
		expect(graph.current).toBeInstanceOf(EffectTriggered);
	});

	it('stores the effect and outcome on the node', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const effect = new NoopEffect();
		graph.effectTriggered(effect, () => undefined);
		const node = graph.current as EffectTriggered<NoopEffect>;
		expect(node.effect).toBe(effect);
		expect(node.outcome).toBeUndefined();
	});

	it('does not add a node when the state callback calls cancelMutation', () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const before = graph.current;
		graph.effectTriggered(new NoopEffect(), () => cancelMutation());
		expect(graph.current).toBe(before);
	});
});

// ─── GameGraph.requestInput / supplyInput ─────────────────────────────────────

describe('GameGraph.requestInput / supplyInput', () => {
	it('adds an InputRequested node with the provided fields', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const target = new Target('player');
		const promise = graph.requestInput(target);
		expect(graph.current).toBeInstanceOf(InputRequested);
		// Resolve the promise so the test doesn't hang
		await graph.supplyInput({ target: [] });
		await promise;
	});

	it('supplyInput adds an InputReceived node', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const target = new Target('player');
		const promise = graph.requestInput(target);
		await graph.supplyInput({ target: ['p1'] });
		expect(graph.current).toBeInstanceOf(InputReceived);
		await promise;
	});

	it('the resolved value contains the supplied values', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const target = new Target('player');
		const promise = graph.requestInput(target);
		await graph.supplyInput({ target: ['p1'] });
		const result = await promise;
		expect(result).toEqual({ target: ['p1'] });
	});
});

// ─── GameGraph.requestSingleTargetOrActiveCard ────────────────────────────────

describe('GameGraph.requestSingleTargetOrActiveCard', () => {
	it('returns the active card id when target is undefined', async () => {
		const c1 = mock<ReadonlyCardState>({ id: 'c1' });
		const p1 = mock<ReadonlyPlayerState>({ getCard: (id) => (id === 'c1' ? c1 : undefined) });
		const graph = new GameGraph({
			initialState: { players: [p1], activeCardStack: ['c1'] }
		});
		const result = await graph.requestSingleTargetOrActiveCard(undefined);
		expect(result).toBe('c1');
	});

	it('requests input and returns the single selected target id', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const target = new Target('player');
		const promise = graph.requestSingleTargetOrActiveCard(target);
		await graph.supplyInput({ target: ['p1'] });
		const result = await promise;
		expect(result).toBe('p1');
	});

	it('throws when more than one target is selected', async () => {
		const graph = new GameGraph({ initialState: { players: [] } });
		const target = new Target('player');
		const promise = graph.requestSingleTargetOrActiveCard(target);
		await graph.supplyInput({ target: ['p1', 'p2'] });
		await expect(promise).rejects.toThrow();
	});
});

// ─── GameGraph.eventTriggered ─────────────────────────────────────────────────

describe('GameGraph.eventTriggered', () => {
	it('does not add any node when no ready card has reactions', async () => {
		const card = mock<ReadonlyCardState>({ getReactionsToEvent: () => [] });
		const p1 = mock<ReadonlyPlayerState>({ cards: () => [card] });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const before = graph.current;
		await graph.eventTriggered('attacking');
		expect(graph.current).toBe(before);
	});

	it('does not react for exhausted cards', async () => {
		const p1 = mock<ReadonlyPlayerState>({ cards: () => [] });
		const graph = new GameGraph({ initialState: { players: [p1] } });
		const before = graph.current;
		await graph.eventTriggered('attacking');
		expect(graph.current).toBe(before);
	});

	it('adds an EventTriggered node when a ready card has matching reactions', async () => {
		const card = mock<ReadonlyCardState>({
			id: 'c1',
			getReactionsToEvent: () => [mock<Obligation>()]
		});
		const p1 = mock<ReadonlyPlayerState>({ cards: () => [card] });
		const graph = new GameGraph({ initialState: { players: [p1] } });

		const eventPromise = graph.eventTriggered('attacking');

		// Expect EventTriggered node has been added synchronously
		const eventNode = graph.start.next!;
		expect(eventNode).toBeInstanceOf(EventTriggered);
		expect((eventNode as EventTriggered).event).toBe(events['attacking']);

		// Decline the optional reaction (selection = undefined)
		await graph.supplyInput({ selection: undefined });
		await eventPromise;
	});

	it('stores the correct event on the EventTriggered node', async () => {
		const card = mock<ReadonlyCardState>({
			id: 'c1',
			getReactionsToEvent: () => [mock<Obligation>()]
		});
		const p1 = mock<ReadonlyPlayerState>({ cards: () => [card] });
		const graph = new GameGraph({ initialState: { players: [p1] } });

		const eventPromise = graph.eventTriggered('investigating');
		const eventNode = graph.start.next as EventTriggered;
		expect(eventNode.event).toBe(events['investigating']);

		await graph.supplyInput({ selection: undefined });
		await eventPromise;
	});
});

// ─── GameGraph.eventTriggered – iterative input ───────────────────────────────

describe('GameGraph.eventTriggered - iterative input', () => {
	function mockCardWithReaction(id: CardId, reaction: Obligation | Opportunity): ReadonlyCardState {
		return mock<ReadonlyCardState>({ id, getReactionsToEvent: () => [reaction] });
	}

	function graphWithReactions(cards: ReadonlyCardState[]) {
		const p1 = mock<ReadonlyPlayerState>({ cards: () => cards });
		const mutablePlayer = mock<MutablePlayerState>({ getCard: () => mock<MutableCardState>() });
		mutablePlayer.readonly.mockReturnValue(p1);
		p1.mutable.mockReturnValue(mutablePlayer);
		return new GameGraph({ initialState: { players: [p1] } });
	}

	function currentChoiceField(graph: GameGraph): CapabilityChoiceField {
		return (graph.current as InputRequested).fields[0] as CapabilityChoiceField;
	}

	it('required is true when the choice set contains an Obligation', async () => {
		const reaction = new Obligation({ effects: [], triggers: ['attacking'] });
		const card = mockCardWithReaction('c1', reaction);
		const graph = graphWithReactions([card]);

		const eventPromise = graph.eventTriggered('attacking');
		expect(currentChoiceField(graph).required).toBe(true);

		await graph.supplyInput({ selection: undefined });
		await eventPromise;
	});

	it('required is false when the choice set contains only Opportunities', async () => {
		const reaction = new Opportunity({ effects: [], triggers: ['attacking'] });
		const card = mockCardWithReaction('c1', reaction);
		const graph = graphWithReactions([card]);

		const eventPromise = graph.eventTriggered('attacking');
		expect(currentChoiceField(graph).required).toBe(false);

		await graph.supplyInput({ selection: undefined });
		await eventPromise;
	});

	it('selecting a reaction calls trigger on the capability', async () => {
		const reaction = mock<Obligation>();
		const card = mockCardWithReaction('c1', reaction);
		const graph = graphWithReactions([card]);

		const eventPromise = graph.eventTriggered('attacking');
		const [choice] = currentChoiceField(graph).choices;
		await graph.supplyInput({ selection: choice });
		await eventPromise;

		expect(reaction.trigger).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c1' }));
	});

	it('selecting a reaction removes it from the choices and loops for the next', async () => {
		const reaction1 = mock<Obligation>();
		const reaction2 = mock<Obligation>();
		const card1 = mockCardWithReaction('c1', reaction1);
		const card2 = mockCardWithReaction('c2', reaction2);
		const graph = graphWithReactions([card1, card2]);

		const eventPromise = graph.eventTriggered('attacking');

		// First request: both reactions available
		const allChoices = [...currentChoiceField(graph).choices];
		expect(allChoices).toMatchObject([
			{ cardId: 'c1', capability: reaction1 },
			{ cardId: 'c2', capability: reaction2 }
		]);
		await graph.supplyInput({ selection: allChoices[0] });
		await advanceTicks(3); // let graph advance past trigger to next InputRequested

		// Second request: only one reaction remains
		expect([...currentChoiceField(graph).choices]).toMatchObject([
			{ cardId: 'c2', capability: reaction2 }
		]);
		await graph.supplyInput({ selection: allChoices[1] });

		await eventPromise;
		expect(reaction1.trigger).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c1' }));
		expect(reaction2.trigger).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c2' }));
	});

	it('supplying undefined breaks the loop without triggering remaining reactions', async () => {
		const reaction1 = mock<Opportunity>();
		const reaction2 = mock<Opportunity>();
		const card1 = mockCardWithReaction('c1', reaction1);
		const card2 = mockCardWithReaction('c2', reaction2);
		const graph = graphWithReactions([card1, card2]);

		const eventPromise = graph.eventTriggered('attacking');
		await graph.supplyInput({ selection: undefined });

		await eventPromise;
		expect(reaction1.trigger).not.toHaveBeenCalled();
		expect(reaction2.trigger).not.toHaveBeenCalled();
	});
});

// ─── cancelMutation ───────────────────────────────────────────────────────────

describe('cancelMutation', () => {
	it('throws when called', () => {
		expect(() => cancelMutation()).toThrow();
	});
});

// ─── GameNode types ───────────────────────────────────────────────────────────

describe('GameNode types', () => {
	const state = makeInitialState();

	it('CapabilityTriggered stores capability and cardId', () => {
		const capability = new Obligation({ effects: [], triggers: ['attacking'] });
		const node = new CapabilityTriggered({ id: 1, state, capability, cardId: 'c1' });
		expect(node.capability).toBe(capability);
		expect(node.cardId).toBe('c1');
	});

	it('CapabilityFinished stores capability and cardId', () => {
		const capability = new Obligation({ effects: [], triggers: ['attacking'] });
		const node = new CapabilityFinished({ id: 1, state, capability, cardId: 'c1' });
		expect(node.capability).toBe(capability);
		expect(node.cardId).toBe('c1');
	});

	it('EffectTriggered stores effect and outcome', () => {
		const effect = new NoopEffect();
		const node = new EffectTriggered({ id: 1, state, effect, outcome: undefined });
		expect(node.effect).toBe(effect);
		expect(node.outcome).toBeUndefined();
	});

	it('EventTriggered stores the event', () => {
		const node = new EventTriggered({ id: 1, state, event: events['attacking'] });
		expect(node.event).toBe(events['attacking']);
	});

	it('InputRequested stores fields', () => {
		const target = new Target('player');
		const field = {
			name: 'target',
			required: true,
			target
		} as unknown as InputRequested['fields'][number];
		const node = new InputRequested({ id: 1, state, fields: [field] });
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
