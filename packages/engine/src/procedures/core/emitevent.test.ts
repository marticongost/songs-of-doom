/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import { type Reaction } from '@songsofdoom/game';
import { describe, expect, it } from 'vitest';
import { ComputeStep } from '../../core/steps';
import type { ReadonlyCardState } from '../../state/cardstate';
import type { MutableGameState, ReadonlyGameState } from '../../state/gamestate';
import type { PlayerId } from '../../state/identifiers';
import type { ReadonlyPlayerState } from '../../state/playerstate';
import { emitEvent, type EmitEventState, type EventContext } from './emitevent';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMutableGame(players: ReadonlyPlayerState[] = []): {
	mutableGame: MutableGameState;
	game: ReadonlyGameState;
} {
	const mutableGame = mock<MutableGameState>();
	const game = mock<ReadonlyGameState>({ players });
	// mutate() calls the callback with the mutable game and returns the (same) ReadonlyGameState
	(game as any).mutate.mockImplementation((fn: (mutable: MutableGameState) => void) => {
		fn(mutableGame);
		return game;
	});
	return { mutableGame, game };
}

function makePlayer(id: PlayerId = 'plr1' as PlayerId): ReadonlyPlayerState {
	return mock<ReadonlyPlayerState>({ id });
}

function makeCard(playerId: PlayerId, reactionOrder = 0): ReadonlyCardState {
	return mock<ReadonlyCardState>({
		card: mock<any>({ reactionOrder }),
		playerId: playerId as any
	});
}

function makeState(overrides: Partial<EmitEventState> = {}): EmitEventState {
	return {
		status: 'ongoing',
		game: mock<ReadonlyGameState>(),
		eventType: 'scenarioStart',
		...overrides
	} as EmitEventState;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('emitEvent', () => {
	const initStep = emitEvent.steps.init as ComputeStep<EmitEventState>;
	const finaliseStep = emitEvent.steps.finalise as ComputeStep<EmitEventState>;

	// ── init step ────────────────────────────────────────────────────────────

	describe('init step', () => {
		it('skips pushContext when eventContext is undefined', () => {
			expect.assertions(2);
			const { mutableGame, game } = makeMutableGame([makePlayer()]);
			(game as any).cards.mockReturnValue([]);

			const state = makeState({ game, eventContext: undefined, eventType: 'scenarioStart' });
			initStep.logic(state);

			expect(mutableGame.pushContext).not.toHaveBeenCalled();
			// cards() should still be called directly on game (no pushContext)
			expect(game.cards).toHaveBeenCalledWith({ ready: true });
		});

		it('pushes context when eventContext is provided', () => {
			expect.assertions(2);
			const { mutableGame, game } = makeMutableGame([makePlayer()]);
			(game as any).cards.mockReturnValue([]);

			const eventContext: EventContext = { subjectId: 'plr1' as PlayerId, targetId: 'crt1' as any };
			const state = makeState({ game, eventContext, eventType: 'attack' });
			initStep.logic(state);

			expect(mutableGame.pushContext).toHaveBeenCalledWith(eventContext);
			expect(game.cards).toHaveBeenCalledWith({ ready: true });
		});

		it('collects reactions from ready cards', () => {
			expect.assertions(1);
			const { game } = makeMutableGame([
				mock<ReadonlyPlayerState>({ id: 'plr1' as PlayerId }),
				mock<ReadonlyPlayerState>({ id: 'plr2' as PlayerId })
			]);

			const reaction1 = mock<Reaction>({ mandatory: false });
			const reaction2 = mock<Reaction>({ mandatory: false });
			const card1 = makeCard('plr1' as PlayerId);
			(card1 as any).getReactionsToEvent.mockReturnValue([reaction1]);

			const card2 = makeCard('plr2' as PlayerId);
			(card2 as any).getReactionsToEvent.mockReturnValue([reaction2]);

			(game as any).cards.mockReturnValue([card1, card2]);

			const state = makeState({
				game,
				eventContext: { subjectId: 'plr1' as PlayerId },
				eventType: 'attack'
			});
			const result = initStep.logic(state);

			expect(result?.reactionGroups).toHaveLength(2);
		});

		it('proceeds directly to finalise when no reactions exist', () => {
			expect.assertions(2);
			const { game } = makeMutableGame([makePlayer()]);
			(game as any).cards.mockReturnValue([]);

			const state = makeState({ game, eventContext: undefined, eventType: 'scenarioStart' });
			const result = initStep.logic(state);

			expect(result?.step).toBe('finalise');
			expect(result?.reactionGroups).toBeUndefined();
		});

		it('automatically triggers a single mandatory reaction', () => {
			expect.assertions(2);
			const { game } = makeMutableGame([
				mock<ReadonlyPlayerState>({ id: 'plr1' as PlayerId }),
				mock<ReadonlyPlayerState>({ id: 'plr2' as PlayerId })
			]);

			const mandatoryReaction = mock<Reaction>({ mandatory: true });
			const card = makeCard('plr1' as PlayerId);
			(card as any).getReactionsToEvent.mockReturnValue([mandatoryReaction]);

			(game as any).cards.mockReturnValue([card]);

			const state = makeState({
				game,
				eventContext: { subjectId: 'plr1' as PlayerId },
				eventType: 'attack'
			});
			const result = initStep.logic(state);

			expect(result?.step).toBe('invokeReaction');
			expect(result?.chosenReaction).toBeDefined();
		});
	});

	// ── finalise step ────────────────────────────────────────────────────────

	describe('finalise step', () => {
		it('skips popContext when eventContext is undefined', () => {
			expect.assertions(2);
			const { mutableGame, game } = makeMutableGame();

			const state = makeState({ game, eventContext: undefined });
			const result = finaliseStep.logic(state);

			expect(mutableGame.popContext).not.toHaveBeenCalled();
			expect(result?.status).toBe('complete');
		});

		it('skips popContext when eventContext is null', () => {
			expect.assertions(2);
			const { mutableGame, game } = makeMutableGame();

			const state = makeState({ game, eventContext: null as any });
			const result = finaliseStep.logic(state);

			expect(mutableGame.popContext).not.toHaveBeenCalled();
			expect(result?.status).toBe('complete');
		});

		it('pops context when eventContext is provided', () => {
			expect.assertions(2);
			const { mutableGame, game } = makeMutableGame();

			const eventContext: EventContext = { subjectId: 'plr1' as PlayerId, targetId: 'crt1' as any };
			const state = makeState({ game, eventContext });
			const result = finaliseStep.logic(state);

			expect(mutableGame.popContext).toHaveBeenCalledWith(eventContext);
			expect(result?.status).toBe('complete');
		});

		it('returns game unchanged when no eventContext (no mutate call)', () => {
			expect.assertions(2);
			const game = mock<ReadonlyGameState>();

			const state = makeState({ game, eventContext: undefined });
			const result = finaliseStep.logic(state);

			expect(game.mutate).not.toHaveBeenCalled();
			expect(result?.game).toBe(game);
		});
	});
});
