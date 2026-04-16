import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { Action } from './capabilities/action';
import type { Effect } from './effects/effect';
import type { MutableCardState } from './game/cardstate';
import type { GameGraph } from './game/gamegraph';
import type { MutableGameState } from './game/gamestate';

// ─── Capability.trigger ───────────────────────────────────────────────────────

describe('Capability.trigger', () => {
	it('passes activeCardId, targetId, and subjectId context to group()', async () => {
		const graph = mock<GameGraph>();
		graph.group.mockResolvedValue(undefined);

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'trt1' });

		expect(graph.group).toHaveBeenCalledWith(
			expect.any(Function), // CapabilityTriggered constructor
			expect.objectContaining({ cardId: 'trt1' }),
			expect.objectContaining({
				activeCardId: 'trt1',
				targetId: 'trt1',
				subjectId: 'trt1',
				opening: expect.any(Function),
				closure: expect.any(Function)
			}),
			expect.any(Function)
		);
	});

	it('triggers all effects inside the callback', async () => {
		const effect = mock<Effect>();
		const graph = mock<GameGraph>();
		graph.group.mockImplementation(async (_nodeType, _nodeProps, _context, callback) => {
			await callback();
		});

		await new Action({ effects: [effect] }).trigger({ gameGraph: graph, cardId: 'trt1' });

		expect(graph.triggerEffect).toHaveBeenCalledWith(effect);
	});

	it('passes an opening that moves the active card from hand to stage', async () => {
		const mutableState = mock<MutableGameState>();
		const card = mock<MutableCardState>({ container: { type: 'hand', playerId: 'plr1' } });
		mutableState.requireCard.mockReturnValue(card);

		const graph = mock<GameGraph>();
		let capturedOpenWith: ((s: MutableGameState) => void) | undefined;
		graph.group.mockImplementation(async (_nodeType, _nodeProps, context) => {
			capturedOpenWith = context.opening;
		});

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'trt1' });
		capturedOpenWith!(mutableState);

		expect(card.moveToStage).toHaveBeenCalledWith(mutableState, 'plr1');
	});

	it('passes a closure that discards the active card when it is in stage', async () => {
		const mutableState = mock<MutableGameState>();
		const card = mock<MutableCardState>({ container: { type: 'stage', playerId: 'plr1' } });
		mutableState.requireCard.mockReturnValue(card);

		const graph = mock<GameGraph>();
		let capturedCloseWith: ((s: MutableGameState) => void) | undefined;
		graph.group.mockImplementation(async (_nodeType, _nodeProps, context) => {
			capturedCloseWith = context.closure;
		});

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'trt1' });
		capturedCloseWith!(mutableState);

		expect(card.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState, 'plr1');
	});

	it('closure does not discard the active card when it is not in hand', async () => {
		const mutableState = mock<MutableGameState>();
		const card = mock<MutableCardState>({ container: { type: 'deck', playerId: 'plr1' } });
		mutableState.requireCard.mockReturnValue(card);

		const graph = mock<GameGraph>();
		let capturedCloseWith: ((s: MutableGameState) => void) | undefined;
		graph.group.mockImplementation(async (_nodeType, _nodeProps, context) => {
			capturedCloseWith = context.closure;
		});

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'trt1' });
		capturedCloseWith!(mutableState);

		expect(card.moveToTopOfDiscardPile).not.toHaveBeenCalled();
	});
});
