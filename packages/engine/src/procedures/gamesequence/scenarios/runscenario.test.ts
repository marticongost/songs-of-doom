/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock all external dependencies before importing the module under test
// ---------------------------------------------------------------------------

const { mockIsScenario, mockEntitiesRequire } = vi.hoisted(() => ({
	mockIsScenario: vi.fn(),
	mockEntitiesRequire: vi.fn()
}));

vi.mock('@songsofdoom/game', async (importOriginal) => {
	const actual: any = await importOriginal();
	return {
		...actual,
		entities: {
			...actual.entities,
			require: (...args: any[]) => mockEntitiesRequire(...args)
		},
		isScenario: (entity: any) => mockIsScenario(entity)
	};
});

vi.mock('@songsofdoom/common', async (importOriginal) => {
	const actual: any = await importOriginal();
	return actual;
});

// Import after mocks are set up
import { mock } from '@songsofdoom/common/test-utils';
import { ProcedureId } from '../../../core/procedureid';
import { CallStep, ComputeStep } from '../../../core/steps';
import type { ReadonlyGameState } from '../../../state/gamestate';
import type { RunScenarioState } from './runscenario';
import { runScenario } from './runscenario';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a minimal RunScenarioState for testing. */
function state(overrides: Partial<RunScenarioState> = {}): RunScenarioState {
	return {
		step: 'init',
		status: 'ongoing',
		game: mock<ReadonlyGameState>({ mutate: () => ({}) as ReadonlyGameState }),
		scenarioId: 'SoHH-sc1',
		...overrides
	};
}

// ---------------------------------------------------------------------------
// Tests — init step
// ---------------------------------------------------------------------------

describe('runScenario — init step', () => {
	const initStep = (runScenario.steps['init'] as ComputeStep<any>).logic;

	it('throws when the scenario is not found in the catalog', () => {
		mockEntitiesRequire.mockImplementation(() => {
			throw new Error("Catalog entry 'SoHH-sc1' not found");
		});
		expect(() => initStep(state())).toThrow("Catalog entry 'SoHH-sc1' not found");
	});

	it('throws when the entity is not a scenario', () => {
		mockEntitiesRequire.mockReturnValue({ type: { id: 'trait' } });
		mockIsScenario.mockReturnValue(false);
		expect(() => initStep(state({ scenarioId: 'bad-scenario' }))).toThrow(
			'Scenario "bad-scenario" not found'
		);
	});

	it('calls state.game.mutate() to set scenario, chapter, and turn', () => {
		const mockGame = mock<ReadonlyGameState>({
			mutate: () => ({}) as unknown as ReadonlyGameState
		});
		const scenario = { type: { id: 'scenario' }, title: { en: 'Test' }, properties: [] };
		const scenarioCard = { id: 'scn1', card: scenario };

		mockEntitiesRequire.mockReturnValue(scenario);
		mockIsScenario.mockReturnValue(true);

		initStep(state({ game: mockGame }));

		expect(mockGame.mutate).toHaveBeenCalledTimes(1);

		// Call the mutate callback to verify what it sets on the mutable state
		const mutateCallback = mockGame.mutate.mock.calls[0][0];
		const mutable = {
			scenario: undefined,
			chapter: undefined,
			turn: undefined,
			createCardState: () => scenarioCard
		};
		mutateCallback(mutable as any);

		expect(mutable.scenario).toBe(scenarioCard);
		expect(mutable.chapter).toBe(0);
		expect(mutable.turn).toBe(0);
	});

	it('auto-advances (returns undefined for step, so engine moves to next step)', () => {
		const mockGame = mock<ReadonlyGameState>({
			mutate: () => ({ mutated: true }) as unknown as ReadonlyGameState
		});
		mockEntitiesRequire.mockReturnValue({ type: { id: 'scenario' } });
		mockIsScenario.mockReturnValue(true);

		// The engine normalizes step to undefined before calling the step function.
		const result = initStep(state({ game: mockGame, step: undefined }));

		expect(result!.step).toBeUndefined();
		expect(result!.game).toEqual({ mutated: true });
	});

	it('resolves the scenario from the catalog using scenarioId', () => {
		const mockGame = mock<ReadonlyGameState>({
			mutate: () => ({}) as unknown as ReadonlyGameState
		});
		mockEntitiesRequire.mockReturnValue({ type: { id: 'scenario' } });
		mockIsScenario.mockReturnValue(true);

		initStep(state({ game: mockGame, scenarioId: 'TDL-ch2' }));

		expect(mockEntitiesRequire).toHaveBeenCalledWith('TDL-ch2');
	});
});

// ---------------------------------------------------------------------------
// Tests — emit step (CallStep wrapping EmitEvent)
// ---------------------------------------------------------------------------

describe('runScenario — emit step', () => {
	const emitStep = runScenario.steps['emit'] as CallStep<any, any>;

	it('delegates to ProcedureId.EmitEvent', () => {
		expect(emitStep.procedureId).toBe(ProcedureId.EmitEvent);
	});

	it('passes eventType "scenarioStart" in the parameters', () => {
		const params = emitStep.parameters(state());

		expect(params).toEqual({ eventType: 'scenarioStart' });
	});

	it('parameters include eventContext as undefined when not provided', () => {
		const params = emitStep.parameters(state());

		expect(params).toHaveProperty('eventContext');
	});
});

// ---------------------------------------------------------------------------
// Tests — beginPlay step (CallStep wrapping chapter)
// ---------------------------------------------------------------------------

describe('runScenario — beginPlay step', () => {
	const beginPlayStep = runScenario.steps['beginPlay'] as CallStep<any, any>;

	it('delegates to ProcedureId.Chapter', () => {
		expect(beginPlayStep.procedureId).toBe(ProcedureId.Chapter);
	});

	it('passes no parameters (chapter uses its own defaults)', () => {
		const params = beginPlayStep.parameters(state());

		expect(params).toEqual({});
	});

	it('has no then callback (uses identity default)', () => {
		// The default `then` returns the parent state unchanged
		const parentState = state({ step: 'beginPlay' });
		const childResult = { status: 'complete' };

		const result = beginPlayStep.then(parentState, childResult);

		expect(result).toBe(parentState);
	});
});
