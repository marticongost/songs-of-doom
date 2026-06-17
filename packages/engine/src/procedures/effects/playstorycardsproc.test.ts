import { mock } from '@songsofdoom/common/test-utils';
import type { PlayStoryCardsEffect, Property, Story } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ProcedureId } from '../../core/procedureid';
import { CallStep, ComputeStep, ForEachStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { CardId, EntityId } from '../../state/identifiers';
import type { EmitEventState } from '../core/emitevent';
import { playStoryCardsEffectProc, type PlayStoryCardsEffectState } from './playstorycardsproc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeStory(id: EntityId): Story {
	return mock<Story>({ id, properties: [] as Property[] });
}

function makeState(overrides?: Partial<PlayStoryCardsEffectState>): PlayStoryCardsEffectState {
	return {
		effect: mock<PlayStoryCardsEffect>(),
		game: mock<ReadonlyGameState>(),
		status: 'ongoing',
		...overrides
	} as PlayStoryCardsEffectState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('playStoryCardsEffectProc', () => {
	const forEachStep = playStoryCardsEffectProc.steps.forEachStoryCard as ForEachStep<
		PlayStoryCardsEffectState,
		'currentCard'
	>;

	// ── forEachStoryCard structure ──────────────────────────────────────

	describe('forEachStoryCard step', () => {
		it('iterates over effect.cards', () => {
			const story1 = mock<Story>({ id: 'stry1' as EntityId });
			const story2 = mock<Story>({ id: 'stry2' as EntityId });
			const cards = [story1, story2];
			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards })
			});

			const items = forEachStep.items(state);

			expect(items).toEqual(cards);
		});

		it('sets the iteration variable name to currentCard', () => {
			expect(forEachStep.name).toBe('currentCard');
		});

		it('has an attach and emit body step', () => {
			expect(forEachStep.steps.attach).toBeDefined();
			expect(forEachStep.steps.emit).toBeDefined();
		});
	});

	// ── attach body step ───────────────────────────────────────────────

	describe('attach body step', () => {
		const attachStep = forEachStep.steps.attach as ComputeStep<PlayStoryCardsEffectState>;

		it('attaches a new card state for the current story to the scenario', () => {
			const story = makeStory('stry1' as EntityId);
			const scenario = mock<MutableCardState>();

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({ scenario });
				cb(mutableGame);
				return game;
			});

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			attachStep.logic(state);

			expect(scenario.addAttachment).toHaveBeenCalled();
			// The first argument should be the mutable game
			expect(scenario.addAttachment).toHaveBeenCalledWith(expect.anything(), expect.anything());
		});

		it('throws when there is no scenario in the game state', () => {
			const story = makeStory('stry1' as EntityId);

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({ scenario: undefined });
				cb(mutableGame);
				return game;
			});

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			expect(() => attachStep.logic(state)).toThrow('No scenario in game state');
		});

		it('returns the mutated game state', () => {
			const story = makeStory('stry1' as EntityId);
			const mutatedGame = mock<ReadonlyGameState>();

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockReturnValue(mutatedGame);

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			const result = attachStep.logic(state);

			expect(result!.game).toBe(mutatedGame);
		});

		it('creates the card state with the story id and entity', () => {
			const story = makeStory('stry1' as EntityId);
			const scenario = mock<MutableCardState>();
			let capturedAttachment: unknown = undefined;

			scenario.addAttachment.mockImplementation((_game, attachment: unknown) => {
				capturedAttachment = attachment;
			});

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({ scenario });
				cb(mutableGame);
				return game;
			});

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			attachStep.logic(state);

			// The attachment should be a MutableCardState with the story's id and entity
			const attachment = capturedAttachment as MutableCardState;
			expect(attachment.id).toBe('stry1');
			expect(attachment.card).toBe(story);
		});
	});

	// ── emit body step ─────────────────────────────────────────────────

	describe('emit body step', () => {
		const emitStep = forEachStep.steps.emit as CallStep<PlayStoryCardsEffectState, EmitEventState>;

		it('emits a storyPlayed event', () => {
			const story = makeStory('stry1' as EntityId);
			const state = makeState({ currentCard: story });

			const params = emitStep.parameters(state);

			expect(params.eventType).toBe('storyPlayed');
		});

		it('sets the current card as the event subject', () => {
			const story = makeStory('stry1' as EntityId);
			const state = makeState({ currentCard: story });

			const params = emitStep.parameters(state);

			expect(params.eventContext).toEqual({ subjectId: 'stry1' as CardId });
		});

		it('calls the EmitEvent procedure', () => {
			const procedureId =
				typeof emitStep.procedureId === 'function'
					? emitStep.procedureId(makeState())
					: emitStep.procedureId;

			expect(procedureId).toBe(ProcedureId.EmitEvent);
		});
	});
});
