/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock all external dependencies before importing the module under test
//
// The transitive import graph of runCampaign pulls in many symbols from
// @songsofdoom/game and @songsofdoom/common.  We use importOriginal to keep
// those working and override only the specific entry points that runCampaign
// itself touches.
//
// vi.mock factories are hoisted; variables they reference MUST be declared
// via vi.hoisted() so they exist when the factory executes.
// ---------------------------------------------------------------------------

const { mockIsCampaign, mockEntitiesRequire, mockReadonlyGameState, mockPlayerState } = vi.hoisted(
	() => ({
		mockIsCampaign: vi.fn(),
		mockEntitiesRequire: vi.fn(),
		mockReadonlyGameState: vi.fn(),
		mockPlayerState: vi.fn()
	})
);

vi.mock('@songsofdoom/game', async (importOriginal) => {
	const actual: any = await importOriginal();
	return {
		...actual,
		entities: {
			...actual.entities,
			require: (...args: any[]) => mockEntitiesRequire(...args)
		},
		isCampaign: (entity: any) => mockIsCampaign(entity)
	};
});

vi.mock('@songsofdoom/common', async (importOriginal) => {
	const actual: any = await importOriginal();
	// Keep the real Counter — it's used as `new Counter()` in the init step
	// and has no side effects worth mocking.
	return actual;
});

vi.mock('../../../state/gamestate', () => ({
	ReadonlyGameState: mockReadonlyGameState
}));

vi.mock('../../../state/playerstate', () => ({
	ReadonlyPlayerState: mockPlayerState
}));

// Import after mocks are set up
import { mock } from '@songsofdoom/common/test-utils';
import type { CharacterState } from '@songsofdoom/game';
import { CallStep, ComputeStep } from '../../../core/steps';
import type { RunCampaignState } from './runcampaign';
import { runCampaign } from './runcampaign';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal mock CharacterState for testing.
 * Uses `mock()` to satisfy the full class interface without defining every method.
 */
function mockCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
	return mock<CharacterState>({
		finalised: true,
		totalXp: 10,
		gold: 5,
		...overrides
	});
}

/** Creates a minimal RunCampaignState for testing. */
function state(overrides: Partial<RunCampaignState> = {}): RunCampaignState {
	return {
		step: 'init',
		status: 'ongoing',
		game: {} as any,
		campaignId: 'SoHH',
		characters: [mockCharacter()],
		...overrides
	};
}

// ---------------------------------------------------------------------------
// Tests — init step
// ---------------------------------------------------------------------------

describe('runCampaign — init step', () => {
	const initStep = (runCampaign.steps['init'] as ComputeStep<any>).logic;

	it('throws when campaignId is missing', () => {
		mockEntitiesRequire.mockImplementation((id: string) => {
			throw new Error(`Catalog entry '${id}' not found`);
		});
		expect(() => initStep(state({ campaignId: undefined }))).toThrow(
			"Catalog entry 'undefined' not found"
		);
	});

	it('throws when the campaign is not a valid campaign type', () => {
		mockIsCampaign.mockReturnValue(false);
		mockEntitiesRequire.mockReturnValue({ type: { id: 'scenario' } });
		expect(() => initStep(state({ campaignId: 'bad-campaign' }))).toThrow(
			'Invalid campaign id: bad-campaign'
		);
	});

	it('throws when no characters are provided', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		expect(() => initStep(state({ characters: [] }))).toThrow(
			'At least one character is required to start a campaign'
		);
	});

	it('throws when characters is undefined', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		expect(() => initStep(state({ characters: undefined }))).toThrow(
			'At least one character is required to start a campaign'
		);
	});

	it('creates one PlayerState per character with sequential ids', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		mockPlayerState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});
		mockReadonlyGameState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});

		const ch1 = mockCharacter({ finalised: true, totalXp: 10, gold: 5 });
		const ch2 = mockCharacter({ finalised: false, totalXp: 0, gold: 0 });
		const characters = [ch1, ch2];
		initStep(state({ characters }));

		// PlayerState constructor called twice
		expect(mockPlayerState).toHaveBeenCalledTimes(2);
		expect(mockPlayerState).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ id: 'plr1', character: ch1 })
		);
		expect(mockPlayerState).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ id: 'plr2', character: ch2 })
		);
	});

	it('initialises player state with empty decks and counts', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		mockPlayerState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});
		mockReadonlyGameState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});

		initStep(state());

		expect(mockPlayerState).toHaveBeenCalledWith(
			expect.objectContaining({
				deck: [],
				hand: [],
				discardPile: [],
				physicalTrauma: 0,
				mentalTrauma: 0
			})
		);
	});

	it('creates a ReadonlyGameState with the players', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		mockReadonlyGameState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});

		const mockPlayer = { id: 'plr1' };
		mockPlayerState.mockImplementation(function (this: any) {
			Object.assign(this, mockPlayer);
			return this;
		});

		initStep(state());

		expect(mockReadonlyGameState).toHaveBeenCalledWith(
			expect.objectContaining({
				players: [mockPlayer],
				encounterDeck: [],
				encounterDiscardPile: []
			})
		);
	});

	it('sets scenarioId by qualifying it with the campaign id', () => {
		mockEntitiesRequire.mockReturnValue({
			initialScenarioId: 'sc1',
			type: { id: 'campaign' }
		});
		mockPlayerState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});
		mockReadonlyGameState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});

		const result = initStep(state({ campaignId: 'SoHH' }));

		expect(result!.scenarioId).toBe('SoHH-sc1');
	});

	it('advances to the next step with step set', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		mockPlayerState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});
		mockReadonlyGameState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});

		const result = initStep(state());

		// The init step explicitly sets step: 'scenario' to continue
		expect(result!.step).toBe('scenario');
	});

	it('preserves fields from the input state', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		mockPlayerState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});
		mockReadonlyGameState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});

		const result = initStep(state({ campaignId: 'MyCampaign' }));

		expect(result!.campaignId).toBe('MyCampaign');
		expect(result!.status).toBe('ongoing');
	});

	it('resolves the campaign from the entities catalog', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);

		initStep(state({ campaignId: 'MyCampaign' }));

		expect(mockEntitiesRequire).toHaveBeenCalledWith('MyCampaign');
	});

	it('handles a character with null (uses empty object as fallback)', () => {
		mockEntitiesRequire.mockReturnValue({ initialScenarioId: 'sc1', type: { id: 'campaign' } });
		mockIsCampaign.mockReturnValue(true);
		mockPlayerState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});
		mockReadonlyGameState.mockImplementation(function (this: any, props: any) {
			Object.assign(this, props);
			return this;
		});

		const characters = [null as any];
		initStep(state({ characters }));

		// The init code does: character ?? ({} as CharacterState)
		// So null character becomes {}
		expect(mockPlayerState).toHaveBeenCalledWith(expect.objectContaining({ character: {} }));
	});
});

// ---------------------------------------------------------------------------
// Tests — scenario CallStep
// ---------------------------------------------------------------------------

describe('runCampaign — scenario CallStep', () => {
	const scenarioStep = runCampaign.steps['scenario'] as CallStep<any, any>;

	describe('parameters', () => {
		it('extracts scenarioId from parent state', () => {
			const params = scenarioStep.parameters(state({ scenarioId: 'SoHH-sc1' }));

			expect(params).toEqual({ scenarioId: 'SoHH-sc1' });
		});

		it('extracts a different scenarioId', () => {
			const params = scenarioStep.parameters(state({ scenarioId: 'TDL-chapter3' }));

			expect(params).toEqual({ scenarioId: 'TDL-chapter3' });
		});
	});

	describe('then callback — scenario loop', () => {
		it('loops back to scenario when nextScenarioId is set', () => {
			const parentState = state({
				step: 'scenario',
				campaignId: 'SoHH'
			});
			const childResult = {
				game: { nextScenarioId: 'sc2' },
				status: 'complete'
			};

			const result = scenarioStep.then!(parentState, childResult);

			expect(result.step).toBe('scenario');
			expect(result.scenarioId).toBe('SoHH-sc2');
		});

		it('completes the campaign when nextScenarioId is undefined', () => {
			const parentState = state({
				step: 'scenario',
				campaignId: 'SoHH'
			});
			const childResult = {
				game: { nextScenarioId: undefined },
				status: 'complete'
			};

			const result = scenarioStep.then!(parentState, childResult);

			expect(result.step).toBeUndefined();
			expect(result.status).toBe('complete');
		});

		it('completes the campaign when nextScenarioId is an empty string', () => {
			const parentState = state({
				step: 'scenario',
				campaignId: 'SoHH'
			});
			const childResult = {
				game: { nextScenarioId: '' },
				status: 'complete'
			};

			// Falsy values like '' are treated as no next scenario
			const result = scenarioStep.then!(parentState, childResult);

			expect(result.step).toBeUndefined();
			expect(result.status).toBe('complete');
		});

		it('preserves campaignId when completing', () => {
			const parentState = state({
				step: 'scenario',
				campaignId: 'MyCampaign'
			});
			const childResult = {
				game: { nextScenarioId: undefined },
				status: 'complete'
			};

			const result = scenarioStep.then!(parentState, childResult);

			expect(result.campaignId).toBe('MyCampaign');
		});

		it('preserves campaignId when looping to next scenario', () => {
			const parentState = state({
				step: 'scenario',
				campaignId: 'SoHH'
			});
			const childResult = {
				game: { nextScenarioId: 'sc3' },
				status: 'complete'
			};

			const result = scenarioStep.then!(parentState, childResult);

			expect(result.campaignId).toBe('SoHH');
		});
	});
});
