/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import { propertyData, Target, type MoveEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { CallStep, ComputeStep, DispatchStep } from '../../core/steps';
import type { ReadonlyCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { CreatureId, LocationId, PlayerId } from '../../state/identifiers';
import type { ReadonlyLocationState } from '../../state/locationstate';
import type { ReadonlyPlayerState } from '../../state/playerstate';
import type { EmitEventState } from '../core/emitevent';
import { moveEffectProc, type MoveEffectState } from './moveproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: MoveEffect, game: ReadonlyGameState): MoveEffectState {
	return { effect, game, status: 'ongoing' } as MoveEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('moveEffectProc', () => {
	const validateStep = moveEffectProc.steps.validate as ComputeStep<MoveEffectState>;
	const resolveDestinationStep = moveEffectProc.steps
		.resolveDestination as DispatchStep<MoveEffectState>;
	const emitLeavingLocationStep = moveEffectProc.steps.emitLeavingLocation as CallStep<
		MoveEffectState,
		EmitEventState
	>;
	const emitMovementStep = moveEffectProc.steps.emitMovement as CallStep<
		MoveEffectState,
		EmitEventState
	>;
	const applyMoveStep = moveEffectProc.steps.applyMove as ComputeStep<MoveEffectState>;
	const emitLocationEnteredStep = moveEffectProc.steps.emitLocationEntered as CallStep<
		MoveEffectState,
		EmitEventState
	>;

	// ── validate ──────────────────────────────────────────────────────────

	describe('validate step', () => {
		it('cancels when subject is not a player', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			// A creature card as subject (not a player)
			const creature = mock<ReadonlyCardState>({ id: 'crt1' as CreatureId });
			(game as any).requireSubject.mockReturnValue(creature);
			const state = makeState(effect, game);

			const result = validateStep.logic(state);

			expect(result!.status).toBe('cancelled');
		});

		it('cancels when player is immobilized', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const player = mock<ReadonlyPlayerState>({ id: 'plr1' as PlayerId });
			(player as any).hasProperty.mockReturnValue(true);
			(game as any).requireSubject.mockReturnValue(player);
			(game as any).requirePlayer.mockReturnValue(player);
			const state = makeState(effect, game);

			const result = validateStep.logic(state);

			expect(result!.status).toBe('cancelled');
			expect((player as any).hasProperty).toHaveBeenCalledWith(propertyData.immobilized);
		});

		it('cancels when player has no current location', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const player = mock<ReadonlyPlayerState>({ id: 'plr1' as PlayerId });
			(player as any).hasProperty.mockReturnValue(false);
			(game as any).requireSubject.mockReturnValue(player);
			(game as any).requirePlayer.mockReturnValue(player);
			(game as any).getEntityLocation.mockReturnValue(undefined);
			const state = makeState(effect, game);

			const result = validateStep.logic(state);

			expect(result!.status).toBe('cancelled');
		});

		it('cancels when current location has no connections', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const player = mock<ReadonlyPlayerState>({ id: 'plr1' as PlayerId });
			(player as any).hasProperty.mockReturnValue(false);
			(game as any).requireSubject.mockReturnValue(player);
			(game as any).requirePlayer.mockReturnValue(player);
			const location = mock<ReadonlyLocationState>({ connections: [] });
			(game as any).getEntityLocation.mockReturnValue(location);
			const state = makeState(effect, game);

			const result = validateStep.logic(state);

			expect(result!.status).toBe('cancelled');
		});

		it('continues when prerequisites are met', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const player = mock<ReadonlyPlayerState>({ id: 'plr1' as PlayerId });
			(player as any).hasProperty.mockReturnValue(false);
			(game as any).requireSubject.mockReturnValue(player);
			(game as any).requirePlayer.mockReturnValue(player);
			const location = mock<ReadonlyLocationState>({
				connections: ['loc2' as LocationId]
			});
			(game as any).getEntityLocation.mockReturnValue(location);
			const state = makeState(effect, game);

			const result = validateStep.logic(state);

			expect(result).toBe(state);
		});
	});

	// ── resolveDestination ────────────────────────────────────────────────

	describe('resolveDestination step', () => {
		it('stores the resolved destination ID in state.destinationId', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['loc5'],
				evaluateScalar: () => 1,
				resolveTarget: () => ['loc5']
			});
			const state = makeState(effect, game);

			const resultStep = resolveDestinationStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<MoveEffectState>).logic(state);
			expect(result!.destinationId).toBe('loc5');
		});

		it('saves undefined when no possible destinations', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => [],
				evaluateScalar: () => 1,
				resolveTarget: () => []
			});
			const state = makeState(effect, game);

			const resultStep = resolveDestinationStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<MoveEffectState>).logic(state);
			expect(result!.destinationId).toBeUndefined();
		});

		it('queries possible locations with cardinality 1', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['loc1'],
				evaluateScalar: () => 1,
				resolveTarget: () => ['loc1']
			});
			const state = makeState(effect, game);

			resolveDestinationStep.factory(state);

			expect(game.determinePossibleTargets).toHaveBeenCalled();
			const calledTarget = (game.determinePossibleTargets as any).mock.calls[0][0] as Target;
			expect(calledTarget.type).toEqual(new Set(['location']));
			expect(calledTarget.cardinality.isSingleTarget()).toBe(true);
		});
	});

	// ── emitLeavingLocation ───────────────────────────────────────────────

	describe('emitLeavingLocation step', () => {
		it('emits leavingLocation event with the current location as target', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const player = mock<ReadonlyPlayerState>({ id: 'plr1' as PlayerId });
			(game as any).requireSubject.mockReturnValue(player);
			const location = mock<ReadonlyLocationState>({ id: 'loc1' as LocationId });
			(game as any).getEntityLocation.mockReturnValue(location);
			const state = makeState(effect, game);

			const params = emitLeavingLocationStep.parameters(state);

			expect(params.eventType).toBe('leavingLocation');
			expect(params.eventContext).toEqual({ targetId: 'loc1' });
		});
	});

	// ── emitMovement ──────────────────────────────────────────────────────

	describe('emitMovement step', () => {
		it('emits movement event with the destination as target', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const state: MoveEffectState = {
				...makeState(effect, game),
				destinationId: 'loc3' as LocationId
			};

			const params = emitMovementStep.parameters(state);

			expect(params.eventType).toBe('movement');
			expect(params.eventContext).toEqual({ targetId: 'loc3' });
		});
	});

	// ── applyMove ─────────────────────────────────────────────────────────

	describe('applyMove step', () => {
		it('sets the actor location to the destination', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const mutableGame = mock<MutableGameState>();
			const subject = { id: 'plr1' as PlayerId };
			(mutableGame as any).requireSubject.mockReturnValue(subject);
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				cb(mutableGame);
				return game;
			});

			const state: MoveEffectState = {
				...makeState(effect, game),
				destinationId: 'loc3' as LocationId
			};

			applyMoveStep.logic(state);

			expect((mutableGame as any).setActorLocation).toHaveBeenCalledWith('plr1', 'loc3');
		});

		it('does nothing when destinationId is undefined', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const mutableGame = mock<MutableGameState>();
			(mutableGame as any).requireSubject.mockReturnValue({ id: 'plr1' as PlayerId });
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				cb(mutableGame);
				return game;
			});

			const state: MoveEffectState = {
				...makeState(effect, game)
			};

			applyMoveStep.logic(state);

			expect((mutableGame as any).setActorLocation).not.toHaveBeenCalled();
		});
	});

	// ── emitLocationEntered ───────────────────────────────────────────────

	describe('emitLocationEntered step', () => {
		it('emits locationEntered event with the destination as target', () => {
			const effect = mock<MoveEffect>();
			const game = mock<ReadonlyGameState>();
			const state: MoveEffectState = {
				...makeState(effect, game),
				destinationId: 'loc3' as LocationId
			};

			const params = emitLocationEnteredStep.parameters(state);

			expect(params.eventType).toBe('locationEntered');
			expect(params.eventContext).toEqual({ targetId: 'loc3' });
		});
	});
});
