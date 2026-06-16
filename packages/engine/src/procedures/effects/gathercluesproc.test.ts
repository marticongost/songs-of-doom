import { mock } from '@songsofdoom/common/test-utils';
import { Target, type GatherCluesEffect } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { CallStep, ComputeStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import { type CardId, type LocationId } from '../../state/identifiers';
import type { ResolveTargetState } from '../core/resolvetarget';
import { gatherCluesEffectProc, type GatherCluesEffectState } from './gathercluesproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: GatherCluesEffect, game: ReadonlyGameState): GatherCluesEffectState {
	return { effect, game, status: 'ongoing' } as GatherCluesEffectState;
}

function setupMutateGame(
	game: ReadonlyGameState,
	subject: MutableCardState,
	locations: Record<string, MutableCardState>
): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
		const mutableGame = mock<MutableGameState>({
			requireSubject: () => subject,
			requireCard: (id: string) => {
				const card = locations[id];
				if (!card) throw new Error(`Card ${id} not found`);
				return card;
			},
			evaluateScalar: () => 0
		} as unknown as MutableGameState);
		cb(mutableGame);
		return game;
	});
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('gatherCluesEffectProc', () => {
	// ── resolveTargets ────────────────────────────────────────────────────

	describe('resolveTargets step', () => {
		const resolveTargetsStep = gatherCluesEffectProc.steps.resolveTargets as CallStep<
			GatherCluesEffectState,
			ResolveTargetState
		>;

		it('passes effect.target as the target to resolve', () => {
			const target = new Target('location');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const effect = mock<GatherCluesEffect>({ target } as any);
			const game = mock<ReadonlyGameState>();

			const params = resolveTargetsStep.parameters(makeState(effect, game));

			expect(params.target).toBe(target);
		});

		it('saves resolvedTargetIds to state.locationIds, defaulting to empty array', () => {
			const effect = mock<GatherCluesEffect>();
			const game = mock<ReadonlyGameState>();
			const state = makeState(effect, game);

			const withIds = resolveTargetsStep.then(state, {
				resolvedTargetIds: ['loc1', 'loc2']
			} as unknown as ResolveTargetState);
			expect(withIds.locationIds).toEqual(['loc1', 'loc2']);

			const withoutIds = resolveTargetsStep.then(state, {} as unknown as ResolveTargetState);
			expect(withoutIds.locationIds).toEqual([]);
		});
	});

	// ── gather ────────────────────────────────────────────────────────────

	describe('gather step', () => {
		const gatherStep = gatherCluesEffectProc.steps.gather as ComputeStep<GatherCluesEffectState>;

		it('gathers clues from locations to the subject, capped by amount', () => {
			const effect = mock<GatherCluesEffect>({ amount: 2 });
			const subject = mock<MutableCardState>({ clues: 0 });
			const location = mock<MutableCardState>({ id: 'loc1' as CardId, clues: 3 });

			const game = mock<ReadonlyGameState>();
			setupMutateGame(game, subject, { loc1: location });

			// Override evaluateScalar to return the effect amount
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireSubject: () => subject,
					requireCard: (id: string) => {
						if (id === 'loc1') return location;
						throw new Error(`Card ${id} not found`);
					},
					evaluateScalar: () => 2
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.locationIds = ['loc1'];

			const result = gatherStep.logic(state);

			expect(result).toBeDefined();
			expect(location.clues).toBe(1); // 3 - 2 = 1
			expect(subject.clues).toBe(2); // 0 + 2 = 2
			expect(result!.gatheredClues.get('loc1' as LocationId)).toBe(2);
		});

		it('caps gathered clues at the location available clues', () => {
			const effect = mock<GatherCluesEffect>({ amount: 5 });
			const subject = mock<MutableCardState>({ clues: 0 });
			const location = mock<MutableCardState>({ id: 'loc1' as CardId, clues: 2 });

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireSubject: () => subject,
					requireCard: (id: string) => {
						if (id === 'loc1') return location;
						throw new Error(`Card ${id} not found`);
					},
					evaluateScalar: () => 5
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.locationIds = ['loc1'];

			const result = gatherStep.logic(state);

			expect(location.clues).toBe(0); // 2 - min(5,2) = 0
			expect(subject.clues).toBe(2); // 0 + min(5,2) = 2
			expect(result!.gatheredClues.get('loc1' as LocationId)).toBe(2); // capped at location clues
		});

		it('gathers from multiple locations', () => {
			const effect = mock<GatherCluesEffect>({ amount: 2 });
			const subject = mock<MutableCardState>({ clues: 1 });
			const location1 = mock<MutableCardState>({ id: 'loc1' as CardId, clues: 1 });
			const location2 = mock<MutableCardState>({ id: 'loc2' as CardId, clues: 3 });

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireSubject: () => subject,
					requireCard: (id: string) => {
						if (id === 'loc1') return location1;
						if (id === 'loc2') return location2;
						throw new Error(`Card ${id} not found`);
					},
					evaluateScalar: () => 2
				} as unknown as MutableGameState);
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.locationIds = ['loc1', 'loc2'];

			const result = gatherStep.logic(state);

			expect(location1.clues).toBe(0); // 1 - min(2,1) = 0
			expect(location2.clues).toBe(1); // 3 - min(2,3) = 1
			expect(subject.clues).toBe(4); // 1 + 1 + 2 = 4
			expect(result!.gatheredClues.get('loc1' as LocationId)).toBe(1); // capped at 1
			expect(result!.gatheredClues.get('loc2' as LocationId)).toBe(2);
		});

		it('evaluates scalar expressions on the mutable game state', () => {
			const effect = mock<GatherCluesEffect>({ amount: 3 });
			const subject = mock<MutableCardState>({ clues: 0 });
			const location = mock<MutableCardState>({ id: 'loc1' as CardId, clues: 5 });
			let capturedMutableGame: MutableGameState | undefined;

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireSubject: () => subject,
					requireCard: () => location,
					evaluateScalar: () => 3
				} as unknown as MutableGameState);
				capturedMutableGame = mutableGame;
				cb(mutableGame);
				return game;
			});

			const state = makeState(effect, game);
			state.locationIds = ['loc1'];

			const result = gatherStep.logic(state);

			expect(capturedMutableGame!.evaluateScalar).toHaveBeenCalledWith(effect.amount);
			expect(result!.gatheredClues.get('loc1' as LocationId)).toBe(3);
		});

		it('returns the mutated game state', () => {
			const effect = mock<GatherCluesEffect>({ amount: 1 });
			const mutatedGame = mock<ReadonlyGameState>();
			const subject = mock<MutableCardState>({ clues: 0 });

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					requireSubject: () => subject,
					evaluateScalar: () => 1
				} as unknown as MutableGameState);
				cb(mutableGame);
				return mutatedGame;
			});

			const state = makeState(effect, game);
			state.locationIds = [];

			const result = gatherStep.logic(state);

			expect(result!.game).toBe(mutatedGame);
			expect(result!.gatheredClues.isEmpty()).toBe(true);
		});
	});
});
