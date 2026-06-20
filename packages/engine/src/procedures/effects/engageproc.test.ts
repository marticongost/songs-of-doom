import { mock } from '@songsofdoom/common/test-utils';
import { ally, creature, skill, Target, type EngageEffect, type Entity } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep, DispatchStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableEntityState } from '../../state/entitystate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { AllyId, CreatureId, EntityId, SkillId } from '../../state/identifiers';
import type { MutablePlayerState } from '../../state/playerstate';
import { engageEffectProc, type EngageEffectState } from './engageproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeState(effect: EngageEffect, game: ReadonlyGameState): EngageEffectState {
	return { effect, game, status: 'ongoing' } as EngageEffectState;
}

function creatureCardState(id: CreatureId): MutableCardState {
	return mock<MutableCardState>({ id, card: mock<Entity>({ type: creature }) });
}

function allyCardState(id: AllyId): MutableCardState {
	return mock<MutableCardState>({ id, card: mock<Entity>({ type: ally }) });
}

function skillCardState(id: SkillId): MutableCardState {
	return mock<MutableCardState>({ id, card: mock<Entity>({ type: skill }) });
}

function playerState(id: string): MutablePlayerState {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return mock<MutablePlayerState>({ id } as any);
}

/**
 * Sets up a mutable game mock that runs a mutation callback.
 * The callback receives a `MutableGameState` configured with the given
 * `subject` and entity state lookups.
 */
function setupMutateGame(
	game: ReadonlyGameState,
	subject: MutablePlayerState | MutableCardState,
	entityStates: Record<string, MutableEntityState<EntityId>>
): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
		const mutableGame = mock<MutableGameState>();
		mutableGame.requireSubject.mockReturnValue(subject);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(mutableGame as any).requireEntityState.mockImplementation((id: string) => {
			const entity = entityStates[id];
			if (!entity) {
				throw new Error(`Entity with id ${id} not found`);
			}
			return entity;
		});
		cb(mutableGame);
		return game;
	});
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('engageEffectProc', () => {
	// ── resolveTargets ────────────────────────────────────────────────────

	describe('resolveTargets step', () => {
		const resolveTargetsStep = engageEffectProc.steps
			.resolveTargets as DispatchStep<EngageEffectState>;

		it('resolves targets using effect.target', () => {
			const target = new Target('enemy');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const effect = mock<EngageEffect>({ target } as any);
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => ['crt1', 'crt2'],
				evaluateScalar: () => 3
			});
			const state = makeState(effect, game);

			const resultStep = resolveTargetsStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			expect(game.determinePossibleTargets).toHaveBeenCalled();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const calledTarget = (game.determinePossibleTargets as any).mock.calls[0][0] as Target;
			expect(calledTarget).toBe(target);

			const result = (resultStep as ComputeStep<EngageEffectState>).logic(state);
			expect(result!.targetIds).toEqual(['crt1', 'crt2']);
		});

		it('saves an empty array when no targets match', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>({
				determinePossibleTargets: () => [],
				evaluateScalar: () => 1
			});
			const state = makeState(effect, game);

			const resultStep = resolveTargetsStep.factory(state);
			expect(resultStep).toBeInstanceOf(ComputeStep);

			const result = (resultStep as ComputeStep<EngageEffectState>).logic(state);
			expect(result!.targetIds).toEqual([]);
		});
	});

	// ── engage ────────────────────────────────────────────────────────────

	describe('engage step', () => {
		const engageStep = engageEffectProc.steps.engage as ComputeStep<EngageEffectState>;

		it('throws when no targets are resolved', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			game.mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				cb(mock<MutableGameState>());
				return game;
			});
			const state = makeState(effect, game);
			state.targetIds = [];

			expect(() => engageStep.logic(state)).toThrow('At least one target must be chosen to engage');
		});

		it('throws when subject is player and a target is not a creature', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			const subjectEntity = playerState('plr1');
			const nonCreature = allyCardState('aly2');

			setupMutateGame(game, subjectEntity, { crt1: creatureCardState('crt1'), crt2: nonCreature });

			const state = makeState(effect, game);
			state.targetIds = ['crt1', 'crt2'];

			expect(() => engageStep.logic(state)).toThrow('Invalid subject/target combination');
		});

		it('attaches each creature to a player subject', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			const subjectEntity = playerState('plr1');
			const creature1 = creatureCardState('crt1');
			const creature2 = creatureCardState('crt2');

			setupMutateGame(game, subjectEntity, { crt1: creature1, crt2: creature2 });

			const state = makeState(effect, game);
			state.targetIds = ['crt1', 'crt2'];

			const result = engageStep.logic(state);

			expect(result).toBeDefined();
			expect(subjectEntity.addAttachment).toHaveBeenCalledTimes(2);
			// The game parameter in addAttachment is the MutableGameState
		});

		it('attaches each creature to an ally subject', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			const subjectEntity = allyCardState('aly1');
			const creature1 = creatureCardState('crt1');
			const creature2 = creatureCardState('crt2');

			setupMutateGame(game, subjectEntity, { crt1: creature1, crt2: creature2 });

			const state = makeState(effect, game);
			state.targetIds = ['crt1', 'crt2'];

			engageStep.logic(state);

			expect(subjectEntity.addAttachment).toHaveBeenCalledTimes(2);
		});

		it('throws when creature subject targets more than one opponent', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			const subjectEntity = creatureCardState('crt1');
			const target1 = playerState('plr1');
			const target2 = playerState('plr2');

			setupMutateGame(game, subjectEntity, { plr1: target1, plr2: target2 });

			const state = makeState(effect, game);
			state.targetIds = ['plr1', 'plr2'];

			expect(() => engageStep.logic(state)).toThrow(
				'Enemies can only be engaged to a single opponent'
			);
		});

		it('throws when creature subject targets a non-player/non-ally', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			const subjectEntity = creatureCardState('crt1');
			const target = creatureCardState('crt2');

			setupMutateGame(game, subjectEntity, { crt2: target });

			const state = makeState(effect, game);
			state.targetIds = ['crt2'];

			expect(() => engageStep.logic(state)).toThrow('Invalid subject/target combination');
		});

		it('attaches the creature subject to a player target', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			const subjectEntity = creatureCardState('crt1');
			const targetPlayer = playerState('plr1');

			setupMutateGame(game, subjectEntity, { plr1: targetPlayer });

			const state = makeState(effect, game);
			state.targetIds = ['plr1'];

			engageStep.logic(state);

			expect(targetPlayer.addAttachment).toHaveBeenCalledTimes(1);
		});

		it('attaches the creature subject to an ally target', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			const subjectEntity = creatureCardState('crt1');
			const targetAlly = allyCardState('aly2');

			setupMutateGame(game, subjectEntity, { crt2: targetAlly });

			const state = makeState(effect, game);
			state.targetIds = ['crt2'];

			engageStep.logic(state);

			expect(targetAlly.addAttachment).toHaveBeenCalledTimes(1);
		});

		it('throws when subject is neither player/ally nor creature', () => {
			const effect = mock<EngageEffect>();
			const game = mock<ReadonlyGameState>();
			// A card that is neither ally nor creature (e.g., a skill)
			const subjectEntity = skillCardState('skl1');
			const target = creatureCardState('crt1');

			setupMutateGame(game, subjectEntity, { crt1: target });

			const state = makeState(effect, game);
			state.targetIds = ['crt1'];

			expect(() => engageStep.logic(state)).toThrow('Invalid subject/target combination');
		});

		it('returns the mutated game state', () => {
			const effect = mock<EngageEffect>();
			const subjectEntity = playerState('plr1');
			const creature = creatureCardState('crt1');
			const mutatedGame = mock<ReadonlyGameState>();
			const game = mock<ReadonlyGameState>();
			game.mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>();
				mutableGame.requireSubject.mockReturnValue(subjectEntity);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(mutableGame as any).requireEntityState.mockReturnValue(creature);
				cb(mutableGame);
				return mutatedGame;
			});

			const state = makeState(effect, game);
			state.targetIds = ['crt1'];

			const result = engageStep.logic(state);
			expect(result!.game).toBe(mutatedGame);
		});
	});
});
