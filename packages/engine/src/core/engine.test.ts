/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { PopGameContextValue } from '../state/gamestate';
import { Engine } from './engine';
import { instructions } from './instructions';
import { ProcedureDefinition, type ProcedureState } from './procedure';
import { ProcedureId } from './procedureid';
import { ComputeStep, InputStep } from './steps';

/** Mirrors the private ProcedureRegistry type from engine.ts for test usage. */
type ProcedureRegistry = Partial<Record<ProcedureId, ProcedureDefinition<any>>>;

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Minimal stub for `ReadonlyGameState` to avoid the full
 * `@songsofdoom/game` import chain (which has circular dependency issues).
 * The engine only passes `state.game` through — tests never read it.
 */
interface MinimalGameState {
	readonly players: ReadonlyArray<any>;
}

function testGame(): any {
	return { players: [] } as MinimalGameState;
}

/**
 * Creates a mock game state that records {@link pushContext} / {@link popContext}
 * calls for verifying {@link ForEachStep} boundContext behaviour.
 */
function mockGameWithContext() {
	const pushCalls: any[] = [];
	const popCalls: any[] = [];

	const mock: any = {
		players: [] as any[],
		pushContext(ctx: any) {
			pushCalls.push(ctx);
		},
		popContext(ctx: any) {
			popCalls.push(ctx);
		},
		mutate(callback: (mutable: any) => void) {
			callback(mock);
			return mock;
		}
	};

	return { mock, pushCalls, popCalls };
}

/** Creates a basic procedure registry with a single procedure. */
function registryWith<S extends ProcedureState>(
	def: ProcedureDefinition<S>
): Record<ProcedureId, ProcedureDefinition<any>> {
	return { [def.id]: def } as Record<ProcedureId, ProcedureDefinition<any>>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Engine with ForEachStep', () => {
	it('skips the loop when the items list is empty', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			currentNumber: number;
			numbers: number[];
		}

		const { forEach: loop } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: {
				loop: loop({
					name: 'currentNumber',
					items: (state: TestState) => state.numbers,
					steps: {
						process: () => undefined
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), { numbers: [] } as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		// Journal should have: initial entry → loop (skipped → then) → done → terminal
		const steps = engine.journal.map((e) => e.state.step);
		expect(steps).toEqual(['loop', 'done', undefined]);
	});

	it('iterates over items, executing body steps for each', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			currentNumber: number;
			numbers: number[];
			processed: number[];
		}

		const { forEach: loop } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { processed: [] } as any,
			steps: {
				loop: loop({
					name: 'currentNumber',
					items: (state: TestState) => state.numbers,
					steps: {
						process: (state: TestState) => ({
							...state,
							processed: [...state.processed, state.currentNumber]
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), { numbers: [10, 20, 30] } as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		const doneEntry = engine.journal.at(-1)!;
		expect((doneEntry.state as any).processed).toEqual([10, 20, 30]);
	});

	it('filters items with the `where` predicate', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			currentNumber: number;
			numbers: number[];
			processed: number[];
		}

		const { forEach: loop } = instructions<TestState>();

		const proc = new ProcedureDefinition<TestState>({
			id: ProcedureId.Unimplemented,
			defaults: { processed: [] } as any,
			steps: {
				loop: loop({
					name: 'currentNumber',
					items: (state: TestState) => state.numbers,
					where: (_state: TestState, n: number) => n > 10,
					steps: {
						process: (state: TestState) => ({
							...state,
							processed: [...state.processed, state.currentNumber]
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), { numbers: [5, 10, 15, 20, 25] } as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		const doneEntry = engine.journal.at(-1)!;
		expect((doneEntry.state as any).processed).toEqual([15, 20, 25]);
	});

	it('pauses and resumes correctly when body has an InputStep', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			currentNumber: number;
			numbers: number[];
			collected: number[];
		}

		const { forEach: loop, input: askInput } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { collected: [] } as any,
			steps: {
				loop: loop({
					name: 'currentNumber',
					items: (state: TestState) => state.numbers,
					steps: {
						ask: askInput({
							fields: [] as const,
							then: (state: TestState, _inputs) => ({
								...state,
								collected: [...state.collected, state.currentNumber]
							})
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), { numbers: [100, 200] } as any)
		);

		// First run: should pause on the first body input.
		let finished = engine.run();
		expect(finished).toBe(false); // paused for input

		// Supply input for first item.
		engine.supplyInput({});
		finished = engine.run();

		// Second run: should pause on the second body input.
		expect(finished).toBe(false); // paused again

		// Supply input for second item.
		engine.supplyInput({});
		finished = engine.run();

		expect(finished).toBe(true); // done
	});

	it('supports nested ForEachSteps', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			outerItem: string;
			innerItem: number;
			groups: Record<string, number[]>;
			collected: Array<{ outer: string; inner: number }>;
		}

		const { forEach: outer, forEach: inner } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { collected: [] } as any,
			steps: {
				outer: outer({
					name: 'outerItem',
					items: (state: TestState) => Object.keys(state.groups),
					steps: {
						inner: (inner as any)({
							name: 'innerItem',
							items: (state: TestState) => state.groups[state.outerItem] ?? [],
							steps: {
								collect: (state: TestState) => {
									return {
										...state,
										collected: [
											...state.collected,
											{ outer: state.outerItem, inner: state.innerItem }
										],
										step: undefined
									};
								}
							},
							then: (state: TestState) => state
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), {
				groups: { a: [1, 2], b: [3] }
			} as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		const doneEntry = engine.journal.at(-1)!;
		expect((doneEntry.state as any).collected).toEqual([
			{ outer: 'a', inner: 1 },
			{ outer: 'a', inner: 2 },
			{ outer: 'b', inner: 3 }
		]);
	});
});

describe('Engine with ForEachStep boundContext', () => {
	it('pushes and pops subjectId context (string shorthand) for each item', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			player: string;
			processed: string[];
		}

		const { forEach: loop } = instructions<TestState>();
		const { mock, pushCalls, popCalls } = mockGameWithContext();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { processed: [] } as any,
			steps: {
				loop: loop({
					name: 'player',
					items: () => ['a', 'b'] as any,
					boundContext: 'subjectId',
					steps: {
						process: (state: TestState) => ({
							...state,
							processed: [...state.processed, state.player]
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(mock, {} as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		// Push order: item 'a', then item 'b'.
		expect(pushCalls).toEqual([{ subjectId: 'a' }, { subjectId: 'b' }]);
		// Pop order: item 'a' (after first body completes), then item 'b' (after second body).
		expect(popCalls).toEqual([
			{ subjectId: PopGameContextValue },
			{ subjectId: PopGameContextValue }
		]);
	});

	it('pushes and pops targetId context (string shorthand) for each item', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			enemy: string;
			processed: string[];
		}

		const { forEach: loop } = instructions<TestState>();
		const { mock, pushCalls, popCalls } = mockGameWithContext();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { processed: [] } as any,
			steps: {
				loop: loop({
					name: 'enemy',
					items: () => ['x', 'y', 'z'] as any,
					boundContext: 'targetId',
					steps: {
						process: (state: TestState) => ({
							...state,
							processed: [...state.processed, state.enemy]
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(mock, {} as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		expect(pushCalls).toEqual([{ targetId: 'x' }, { targetId: 'y' }, { targetId: 'z' }]);
		expect(popCalls).toEqual([
			{ targetId: PopGameContextValue },
			{ targetId: PopGameContextValue },
			{ targetId: PopGameContextValue }
		]);
	});

	it('calls boundContext function to build the pushed/popped context', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			player: { id: string; name: string };
			processed: string[];
		}

		const { forEach: loop } = instructions<TestState>();
		const { mock, pushCalls, popCalls } = mockGameWithContext();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { processed: [] } as any,
			steps: {
				loop: loop({
					name: 'player',
					items: () =>
						[
							{ id: 'p1', name: 'Alice' },
							{ id: 'p2', name: 'Bob' }
						] as any,
					boundContext: (_state: any, player: { id: string }) =>
						({
							subjectId: player.id
						}) as any,
					steps: {
						process: (state: TestState) => ({
							...state,
							processed: [...state.processed, state.player.id]
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(mock, {} as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		expect(pushCalls).toEqual([{ subjectId: 'p1' }, { subjectId: 'p2' }]);
		expect(popCalls).toEqual([
			{ subjectId: PopGameContextValue },
			{ subjectId: PopGameContextValue }
		]);
	});

	it('does not push or pop context when boundContext is unset', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			player: string;
		}

		const { forEach: loop } = instructions<TestState>();
		const { mock, pushCalls, popCalls } = mockGameWithContext();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: {
				loop: loop({
					name: 'player',
					items: () => ['a', 'b'] as any,
					// boundContext not set
					steps: {
						process: () => undefined
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(mock, {} as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		expect(pushCalls).toEqual([]);
		expect(popCalls).toEqual([]);
	});

	it('skips push/pop for items filtered out by `where`', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			player: string;
			processed: string[];
		}

		const { forEach: loop } = instructions<TestState>();
		const { mock, pushCalls, popCalls } = mockGameWithContext();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { processed: [] } as any,
			steps: {
				loop: loop({
					name: 'player',
					items: () => ['a', 'b', 'c'] as any,
					boundContext: 'subjectId',
					where: (_state, item: string) => item !== 'b',
					steps: {
						process: (state: TestState) => ({
							...state,
							processed: [...state.processed, state.player]
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(mock, {} as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		// 'b' is filtered out — only 'a' and 'c' trigger context.
		expect(pushCalls).toEqual([{ subjectId: 'a' }, { subjectId: 'c' }]);
		expect(popCalls).toEqual([
			{ subjectId: PopGameContextValue },
			{ subjectId: PopGameContextValue }
		]);
	});

	it('does not push context for empty loops', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			player: string;
		}

		const { forEach: loop } = instructions<TestState>();
		const { mock, pushCalls, popCalls } = mockGameWithContext();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: {
				loop: loop({
					name: 'player',
					items: () => [] as any,
					boundContext: 'subjectId',
					steps: {
						process: () => undefined
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(mock, {} as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		expect(pushCalls).toEqual([]);
		expect(popCalls).toEqual([]);
	});

	it('preserves context across pause/resume with InputStep', () => {
		expect.assertions(5);

		interface TestState extends ProcedureState {
			player: string;
			collected: string[];
		}

		const { forEach: loop, input: askInput } = instructions<TestState>();
		const { mock, pushCalls, popCalls } = mockGameWithContext();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { collected: [] } as any,
			steps: {
				loop: loop({
					name: 'player',
					items: () => ['a', 'b'] as any,
					boundContext: 'subjectId',
					steps: {
						ask: askInput({
							fields: [] as const,
							then: (state: TestState, _inputs) => ({
								...state,
								collected: [...state.collected, state.player]
							})
						})
					},
					then: (state: TestState) => ({ ...state, step: 'done' })
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(mock, {} as any)
		);

		// First run: pauses for input on first item.
		let finished = engine.run();
		expect(finished).toBe(false);

		// Supply input — body step completes, advancing to second item.
		engine.supplyInput({});
		finished = engine.run();
		expect(finished).toBe(false); // paused on second item

		engine.supplyInput({});
		finished = engine.run();
		expect(finished).toBe(true);

		expect(pushCalls).toEqual([{ subjectId: 'a' }, { subjectId: 'b' }]);
		expect(popCalls).toEqual([
			{ subjectId: PopGameContextValue },
			{ subjectId: PopGameContextValue }
		]);
	});
});

describe('Engine with DispatchStep', () => {
	it('delegates to a ComputeStep produced at runtime', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			value: number;
		}

		const { dispatch: d } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: {
				conditional: d((state: TestState) => {
					if (state.value > 5) {
						return new ComputeStep({
							logic: (s: TestState) => ({ ...s, status: 'complete' })
						});
					}
					return new ComputeStep({
						logic: (s: TestState) => ({ ...s, status: 'complete' })
					});
				})
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), { value: 10 } as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);

		const steps = engine.journal.map((e) => e.state.step);
		expect(steps).toEqual(['conditional', undefined]);
	});

	it('delegates to an InputStep when the factory decides', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			needsInput: boolean;
			confirmed?: boolean;
		}

		const { dispatch: d } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: {
				maybeAsk: d((state: TestState) => {
					if (state.needsInput) {
						return new InputStep({
							fields: [] as const,
							then: (s: any) => ({ ...s, confirmed: true, step: 'done' })
						});
					}
					return new ComputeStep({
						logic: (s: TestState) => ({ ...s, step: 'done' })
					});
				}),
				done: (state) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), { needsInput: true } as any)
		);

		// Should pause for input
		let finished = engine.run();
		expect(finished).toBe(false);

		engine.supplyInput({});
		finished = engine.run();
		expect(finished).toBe(true);

		const lastState = engine.journal.at(-1)!.state as any;
		expect(lastState.confirmed).toBe(true);
	});

	it('supports chained DispatchSteps (recursive resolution)', () => {
		expect.assertions(1);

		interface TestState extends ProcedureState {
			level: number;
		}

		const { dispatch: d } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: {
				chain: d((_state: TestState) =>
					d(
						(_innerState: TestState) =>
							new ComputeStep({
								logic: (s: TestState) => ({
									...s,
									level: s.level + 1,
									status: 'complete'
								})
							})
					)
				)
			}
		});

		const engine = Engine.create(
			registryWith(proc),
			ProcedureId.Unimplemented,
			proc.createState(testGame(), { level: 0 } as any)
		);

		const finished = engine.run();
		expect(finished).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Engine.restore
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Engine.create — state initialization (bugfix: defaults merging)
// ---------------------------------------------------------------------------

describe('Engine.create state initialization', () => {
	it('merges procedure defaults into initial state', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			name: string;
			count: number;
		}

		const proc = new ProcedureDefinition<TestState>({
			id: ProcedureId.Unimplemented,
			defaults: { name: 'default-name', count: 0 },
			steps: {
				start: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(registryWith(proc), ProcedureId.Unimplemented, {
			game: testGame()
		} as Partial<TestState>);

		const initialState = engine.currentEntry!.state as TestState;
		expect(initialState.name).toBe('default-name');
		expect(initialState.count).toBe(0);
		expect(initialState.step).toBe('start');
	});

	it('caller overrides take precedence over procedure defaults', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			name: string;
		}

		const proc = new ProcedureDefinition<TestState>({
			id: ProcedureId.Unimplemented,
			defaults: { name: 'default-name' },
			steps: {
				start: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(registryWith(proc), ProcedureId.Unimplemented, {
			game: testGame(),
			name: 'overridden-name'
		} as Partial<TestState>);

		const initialState = engine.currentEntry!.state as TestState;
		expect(initialState.name).toBe('overridden-name');
		expect(initialState.step).toBe('start');
	});

	it('always sets step to the first step — callers never need to set it', () => {
		expect.assertions(1);

		interface TestState extends ProcedureState {
			x: number;
		}

		const proc = new ProcedureDefinition<TestState>({
			id: ProcedureId.Unimplemented,
			defaults: { x: 42 },
			steps: {
				first: () => undefined,
				second: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		// When the caller does NOT provide step, it defaults to the first step
		const engine = Engine.create(registryWith(proc), ProcedureId.Unimplemented, {
			game: testGame()
		} as Partial<TestState>);

		expect((engine.currentEntry!.state as TestState).step).toBe('first');
	});

	it('accepts partial state with only game provided', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			count: number;
		}

		const proc = new ProcedureDefinition<TestState>({
			id: ProcedureId.Unimplemented,
			defaults: { count: 0 },
			steps: {
				step1: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(registryWith(proc), ProcedureId.Unimplemented, {
			game: testGame()
		} as Partial<TestState>);

		const initialState = engine.currentEntry!.state as TestState;
		expect(initialState.count).toBe(0);
		expect(initialState.step).toBe('step1');
	});

	it('throws when the procedure is unknown', () => {
		expect.assertions(1);

		expect(() =>
			Engine.create({} as ProcedureRegistry, ProcedureId.Unimplemented, {
				game: testGame()
			} as any)
		).toThrow('Cannot create engine: unknown procedure "Unimplemented".');
	});

	it('uses defaults factory when provided as a function', () => {
		expect.assertions(2);

		interface TestState extends ProcedureState {
			playerCount: number;
		}

		const proc = new ProcedureDefinition<TestState>({
			id: ProcedureId.Unimplemented,
			defaults: (game: any) => ({ playerCount: game.players.length }),
			steps: {
				step1: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		const engine = Engine.create(registryWith(proc), ProcedureId.Unimplemented, {
			game: testGame()
		} as Partial<TestState>);

		const initialState = engine.currentEntry!.state as TestState;
		expect(initialState.playerCount).toBe(0);
		expect(initialState.step).toBe('step1');
	});
});

// ---------------------------------------------------------------------------
// Engine.restore
// ---------------------------------------------------------------------------

describe('Engine.restore', () => {
	it('restores an engine with the given journal', () => {
		expect.assertions(1);

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: { dummy: () => undefined }
		});

		const journal = [
			{
				procedureId: ProcedureId.Unimplemented,
				state: { step: 'dummy', status: 'complete' as const, game: testGame() }
			}
		];

		const restored = Engine.restore(registryWith(proc), journal);

		expect([...restored.journal]).toEqual(journal);
	});

	it('throws when the journal is empty', () => {
		expect.assertions(1);

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			steps: { dummy: () => undefined }
		});

		expect(() => Engine.restore(registryWith(proc), [])).toThrow(
			'Cannot restore engine: journal is empty.'
		);
	});

	it('can resume execution from a restored engine paused at an InputStep', () => {
		expect.assertions(3);

		interface TestState extends ProcedureState {
			collected: string[];
		}

		const { input: askInput } = instructions<TestState>();

		const proc = new ProcedureDefinition({
			id: ProcedureId.Unimplemented,
			defaults: { collected: [] } as any,
			steps: {
				ask: askInput({
					fields: [] as const,
					then: (state: TestState, _inputs) => ({
						...state,
						collected: [...state.collected, 'got-input']
					})
				}),
				done: (state: TestState) => ({ ...state, status: 'complete' })
			}
		});

		// Hand-craft a journal paused at the InputStep
		const journal = [
			{
				procedureId: ProcedureId.Unimplemented,
				state: {
					step: 'ask',
					status: 'ongoing' as const,
					game: testGame(),
					collected: []
				}
			}
		];

		const restored = Engine.restore(registryWith(proc), journal);

		// Should not be complete yet — it's paused
		expect(restored.currentEntry!.state.status).toBe('ongoing');

		// Resume
		restored.supplyInput({});
		const finished = restored.run();

		expect(finished).toBe(true);
		const doneEntry = restored.journal.at(-1)!;
		expect((doneEntry.state as any).collected).toEqual(['got-input']);
	});
});

// ---------------------------------------------------------------------------
// Engine with CallStep
// ---------------------------------------------------------------------------

describe('Engine with CallStep', () => {
	it('auto-advances to the next step when the CallStep has no `then`', () => {
		expect.assertions(2);

		interface ChildState extends ProcedureState {
			message: string;
		}

		const childProc = new ProcedureDefinition<ChildState>({
			id: ProcedureId.Unimplemented,
			steps: {
				finish: (state: ChildState) => ({
					...state,
					message: 'child-done',
					status: 'complete'
				})
			}
		});

		interface ParentState extends ProcedureState {
			childMessage?: string;
		}

		const { call, define } = instructions<ParentState>();

		const parentProc = define({
			id: ProcedureId.UnimplementedAlt,
			steps: {
				invoke: call(childProc),
				after: (state: ParentState) => ({
					...state,
					childMessage: 'parent-continued',
					status: 'complete'
				})
			}
		});

		const allProcs: ProcedureRegistry = {
			[childProc.id]: childProc,
			[parentProc.id]: parentProc
		};

		const engine = Engine.create(allProcs, parentProc.id, parentProc.createState(testGame(), {}));

		const finished = engine.run();
		expect(finished).toBe(true);

		// Should have reached the 'after' step
		const lastEntry = engine.journal.at(-1)!;
		expect((lastEntry.state as ParentState).childMessage).toBe('parent-continued');
	});

	it('uses the `then` callback when provided to set explicit step', () => {
		expect.assertions(2);

		interface ChildState extends ProcedureState {
			value: number;
		}

		const childProc = new ProcedureDefinition<ChildState>({
			id: ProcedureId.Unimplemented,
			steps: {
				finish: (state: ChildState) => ({
					...state,
					value: 42,
					status: 'complete'
				})
			}
		});

		interface ParentState extends ProcedureState {
			result?: number;
		}

		const { call, define } = instructions<ParentState>();

		const parentProc = define({
			id: ProcedureId.UnimplementedAlt,
			steps: {
				invoke: call(childProc, {}, (state, child: ChildState) => ({
					...state,
					result: child.value,
					step: 'done'
				})),
				unreachable: (state: ParentState) => ({
					...state,
					status: 'complete'
				}),
				done: (state: ParentState) => ({
					...state,
					status: 'complete'
				})
			}
		});

		const allProcs: ProcedureRegistry = {
			[childProc.id]: childProc,
			[parentProc.id]: parentProc
		};

		const engine = Engine.create(allProcs, parentProc.id, parentProc.createState(testGame(), {}));

		const finished = engine.run();
		expect(finished).toBe(true);

		const lastEntry = engine.journal.at(-1)!;
		expect((lastEntry.state as ParentState).result).toBe(42);
	});

	it('auto-advances when `then` callback returns step: undefined', () => {
		expect.assertions(2);

		interface ChildState extends ProcedureState {
			value: number;
		}

		const childProc = new ProcedureDefinition<ChildState>({
			id: ProcedureId.Unimplemented,
			steps: {
				finish: (state: ChildState) => ({
					...state,
					value: 7,
					status: 'complete'
				})
			}
		});

		interface ParentState extends ProcedureState {
			result?: number;
			reachedNext?: boolean;
		}

		const { call, define } = instructions<ParentState>();

		const parentProc = define({
			id: ProcedureId.UnimplementedAlt,
			steps: {
				invoke: call(childProc, {}, (state, child: ChildState) => ({
					...state,
					result: child.value
					// intentionally no `step` — should auto-advance
				})),
				after: (state: ParentState) => ({
					...state,
					reachedNext: true,
					status: 'complete'
				})
			}
		});

		const allProcs: ProcedureRegistry = {
			[childProc.id]: childProc,
			[parentProc.id]: parentProc
		};

		const engine = Engine.create(allProcs, parentProc.id, parentProc.createState(testGame(), {}));

		const finished = engine.run();
		expect(finished).toBe(true);

		const lastEntry = engine.journal.at(-1)!;
		const lastState = lastEntry.state as ParentState;
		expect(lastState.reachedNext).toBe(true);
	});
});
