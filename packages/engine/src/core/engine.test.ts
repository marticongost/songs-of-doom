/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { instructions } from './instructions';
import { ProcedureDefinition, type ProcedureState } from './procedure';
import { ProcedureId } from './procedureid';
import { ComputeStep, InputStep } from './steps';

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
