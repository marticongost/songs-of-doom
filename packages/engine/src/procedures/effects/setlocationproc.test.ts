/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import { Target, type SetLocationEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep, DispatchStep, ForEachStep } from '../../core/steps';
import type { ReadonlyGameState } from '../../state/gamestate';
import type { EntityId, LocationId, PlayerId } from '../../state/identifiers';
import { setLocationEffectProc, type SetLocationEffectState } from './setlocationproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(
	effect: SetLocationEffect,
	game: ReadonlyGameState,
	overrides: Partial<SetLocationEffectState> = {}
): SetLocationEffectState {
	return {
		effect,
		game,
		status: 'ongoing',
		targetIds: [],
		movements: new Map(),
		...overrides
	} as SetLocationEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('setLocationEffectProc', () => {
	const resolveTargetsStep = setLocationEffectProc.steps
		.resolveTargets as DispatchStep<SetLocationEffectState>;

	describe('resolveTargets step', () => {
		it('resolves effect.target when provided', () => {
			const target = new Target('player');
			const effect = mock<SetLocationEffect>({ target, destination: new Target('location') });
			const game = makeMockGame();
			const state = makeState(effect, game);

			const resultStep = resolveTargetsStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<SetLocationEffectState>).logic(state);
			expect(result!.targetIds).toEqual(['plr1']);
		});

		it('defaults target to current-subject when not provided', () => {
			const effect = mock<SetLocationEffect>({ destination: new Target('location') });
			const game = makeMockGame();
			const state = makeState(effect, game);

			const resultStep = resolveTargetsStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<SetLocationEffectState>).logic(state);
			expect(result!.targetIds).toEqual(['plr1']);
		});
	});

	// ── moveTargets forEach ────────────────────────────────────────────────

	const moveTargetsStep = setLocationEffectProc.steps.moveTargets as ForEachStep<
		SetLocationEffectState,
		'currentEntityId'
	>;

	describe('moveTargets forEach', () => {
		it('iterates over targetIds', () => {
			const effect = mock<SetLocationEffect>();
			const game = makeMockGame();
			const state = makeState(effect, game, { targetIds: ['plr1' as EntityId] });

			const items = moveTargetsStep.items(state);
			expect(items).toEqual(['plr1']);
		});

		it('handles empty targetIds', () => {
			const effect = mock<SetLocationEffect>();
			const game = makeMockGame();
			const state = makeState(effect, game);

			const items = moveTargetsStep.items(state);
			expect(items).toEqual([]);
		});

		it('sets boundContext to subjectId', () => {
			expect(moveTargetsStep.boundContext).toBe('subjectId');
		});
	});

	// ── resolveDestination step ────────────────────────────────────────────

	const resolveDestinationStep = moveTargetsStep.steps
		.resolveDestination as DispatchStep<SetLocationEffectState>;

	describe('resolveDestination step', () => {
		it('stores the resolved destination ID in state.destinationId', () => {
			const destination = new Target('location');
			const effect = mock<SetLocationEffect>({ destination });
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['loc1'],
				evaluateScalar: () => 1,
				resolveTarget: () => ['loc1']
			});
			const state = makeState(effect, game, {
				currentEntityId: 'plr1' as PlayerId
			});

			const resultStep = resolveDestinationStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<SetLocationEffectState>).logic(state);
			expect(result!.destinationId).toBe('loc1');
		});
	});

	// ── emitLeaving dispatch ───────────────────────────────────────────────

	const emitLeavingStep = moveTargetsStep.steps.emitLeaving as DispatchStep<SetLocationEffectState>;

	describe('emitLeaving step', () => {
		it('does nothing when entity is a card (not a player)', () => {
			const effect = mock<SetLocationEffect>();
			const game = makeMockGame();
			const state = makeState(effect, game, {
				currentEntityId: 'loc2' as LocationId
			});

			const result = emitLeavingStep.factory(state);
			// When dispatch returns a plain object, it wraps in ComputeStep
			expect(result).toBeInstanceOf(ComputeStep);
		});

		it('does nothing when player has no current location', () => {
			const effect = mock<SetLocationEffect>();
			const game = mock<ReadonlyGameState>();
			(game as any).getEntityLocation.mockReturnValue(undefined);

			const state = makeState(effect, game, {
				currentEntityId: 'plr1' as PlayerId
			});

			const result = emitLeavingStep.factory(state);
			expect(typeof result).toBe('object');
		});

		it('emits leavingLocation event for player with current location', () => {
			const effect = mock<SetLocationEffect>();
			const game = mock<ReadonlyGameState>();
			const locationState = mock<{ id: string }>({ id: 'loc1' });
			(game as any).getEntityLocation.mockReturnValue(locationState);

			const state = makeState(effect, game, {
				currentEntityId: 'plr1' as PlayerId
			});

			const result = emitLeavingStep.factory(state);
			expect(result).not.toBeInstanceOf(ComputeStep);
			expect(result).not.toBeNull();
		});
	});

	// ── applyMove step ─────────────────────────────────────────────────────

	const applyMoveStep = moveTargetsStep.steps.applyMove as ComputeStep<SetLocationEffectState>;

	describe('applyMove step', () => {
		it('moves a player using setActorLocation and records the movement', () => {
			const effect = mock<SetLocationEffect>();
			const game = mock<ReadonlyGameState>();
			const mutableGame = mock<any>();
			(game as any).mutate.mockImplementation((cb: (m: any) => void) => {
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game, {
				currentEntityId: 'plr1' as PlayerId,
				destinationId: 'loc3' as LocationId,
				movements: new Map()
			});

			const result = applyMoveStep.logic(state);

			expect(mutableGame.setActorLocation).toHaveBeenCalledWith('plr1', 'loc3');
			expect(result!.movements!.get('plr1')).toBe('loc3');
		});

		it('moves a card to a location as an attachment and records the movement', () => {
			const effect = mock<SetLocationEffect>();
			const game = mock<ReadonlyGameState>();
			const mutableGame = mock<any>();
			const mutableCard = mock<any>({ id: 'itm1' });
			const mutableLocation = mock<any>({ attachments: ['existing' as any] });
			// Make attachments a mutable array with push
			mutableLocation.attachments = ['existing' as any];
			(mutableLocation as any).attachments.push = (item: any) => {
				(mutableLocation as any).attachments = [...mutableLocation.attachments, item];
			};
			(mutableGame as any).requireCard
				.mockReturnValueOnce(mutableCard)
				.mockReturnValueOnce(mutableLocation);
			(game as any).mutate.mockImplementation((cb: (m: any) => void) => {
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game, {
				currentEntityId: 'itm1' as EntityId,
				destinationId: 'loc3' as LocationId,
				movements: new Map()
			});

			const result = applyMoveStep.logic(state);

			expect(mutableGame.requireCard).toHaveBeenCalledWith('itm1');
			expect(mutableGame.requireCard).toHaveBeenCalledWith('loc3');
			expect(mutableCard.container).toEqual({ type: 'location', locationId: 'loc3' });
			expect(result!.movements!.get('itm1')).toBe('loc3');
		});
	});

	// ── emitEntering dispatch ──────────────────────────────────────────────

	const emitEnteringStep = moveTargetsStep.steps
		.emitEntering as DispatchStep<SetLocationEffectState>;

	describe('emitEntering step', () => {
		it('does nothing when entity is a card (not a player)', () => {
			const effect = mock<SetLocationEffect>();
			const game = makeMockGame();
			const state = makeState(effect, game, {
				currentEntityId: 'itm1' as EntityId
			});

			const result = emitEnteringStep.factory(state);
			expect(typeof result).toBe('object');
		});

		it('emits locationEntered event for player', () => {
			const effect = mock<SetLocationEffect>();
			const game = makeMockGame();
			const state = makeState(effect, game, {
				currentEntityId: 'plr1' as PlayerId,
				destinationId: 'loc3' as LocationId
			});

			const result = emitEnteringStep.factory(state);
			expect(result).not.toBeInstanceOf(ComputeStep);
		});
	});
});

// ─── Shared test helpers ─────────────────────────────────────────────────────

function makeMockGame(): ReadonlyGameState {
	return mock<ReadonlyGameState>({
		determinePossibleTargets: () => ['plr1'],
		evaluateScalar: () => 1,
		resolveTarget: () => ['plr1']
	});
}
