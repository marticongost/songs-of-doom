import { mock } from '@songsofdoom/common/test-utils';
import type { PlayStoryCardsEffect, Property, Story } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ProcedureId } from '../../core/procedureid';
import { CallStep, ComputeStep, ForEachStep } from '../../core/steps';
import type { MutableCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { CardId, EntityId, StoryId } from '../../state/identifiers';
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

		/** Helper to set up the game mock with createCardState returning the given card. */
		function mockGameWithCreateCardState(
			returnedCard: MutableCardState,
			scenario?: MutableCardState
		) {
			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({
					scenario: scenario ?? mock<MutableCardState>()
				});
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(mutableGame as any).createCardState.mockReturnValue(returnedCard);
				cb(mutableGame);
				return game;
			});
			return game;
		}

		it('attaches a new card state for the current story to the scenario', () => {
			const story = makeStory('stry1' as EntityId);
			const scenario = mock<MutableCardState>();
			const createdCard = mock<MutableCardState>({ id: 'sto1' as StoryId });
			const game = mockGameWithCreateCardState(createdCard, scenario);

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			const result = attachStep.logic(state);

			expect(scenario.addAttachment).toHaveBeenCalled();
			expect(scenario.addAttachment).toHaveBeenCalledWith(expect.anything(), createdCard);
			expect(result!.currentCardId).toBe('sto1');
		});

		it('throws when there is no scenario in the game state', () => {
			const story = makeStory('stry1' as EntityId);

			const game = mock<ReadonlyGameState>({ scenario: undefined });

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			expect(() => attachStep.logic(state)).toThrow('No scenario in game state');
		});

		it('returns the state with currentCardId set', () => {
			const story = makeStory('stry1' as EntityId);
			const createdCard = mock<MutableCardState>({ id: 'sto1' as StoryId });
			const game = mockGameWithCreateCardState(createdCard);

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			const result = attachStep.logic(state);

			expect(result!.currentCardId).toBe('sto1');
		});

		it('calls createCardState with the current story entity', () => {
			const story = makeStory('stry1' as EntityId);
			let capturedEntity: unknown = undefined;

			const game = mock<ReadonlyGameState>();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(game as any).mutate.mockImplementation((cb: (mutable: MutableGameState) => void) => {
				const mutableGame = mock<MutableGameState>({ scenario: mock<MutableCardState>() });
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(mutableGame as any).createCardState.mockImplementation((entity: unknown) => {
					capturedEntity = entity;
					return mock<MutableCardState>({ id: 'sto1' as StoryId });
				});
				cb(mutableGame);
				return game;
			});

			const state = makeState({
				effect: mock<PlayStoryCardsEffect>({ cards: [story] }),
				game,
				currentCard: story
			});

			attachStep.logic(state);

			expect(capturedEntity).toBe(story);
		});
	});

	// ── emit body step ─────────────────────────────────────────────────

	describe('emit body step', () => {
		const emitStep = forEachStep.steps.emit as CallStep<PlayStoryCardsEffectState, EmitEventState>;

		it('emits a storyPlayed event', () => {
			const state = makeState({ currentCardId: 'sto1' as StoryId });

			const params = emitStep.parameters(state);

			expect(params.eventType).toBe('storyPlayed');
		});

		it('sets the current card id as the event subject', () => {
			const state = makeState({ currentCardId: 'sto1' as StoryId });

			const params = emitStep.parameters(state);

			expect(params.eventContext).toEqual({ subjectId: 'sto1' as CardId });
		});

		it('calls the EmitEvent procedure', () => {
			const procedureId =
				typeof emitStep.procedureId === 'function'
					? emitStep.procedureId(makeState({ currentCardId: 'sto1' as StoryId }))
					: emitStep.procedureId;

			expect(procedureId).toBe(ProcedureId.EmitEvent);
		});
	});
});
