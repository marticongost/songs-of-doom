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

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'c1' });

		expect(graph.group).toHaveBeenCalledWith(
			expect.any(Function), // CapabilityTriggered constructor
			expect.objectContaining({ cardId: 'c1' }),
			expect.objectContaining({ activeCardId: 'c1', targetId: 'c1', subjectId: 'c1' }),
			expect.any(Function)
		);
	});

	it('triggers all effects inside the callback', async () => {
		const effect = mock<Effect>();
		const graph = mock<GameGraph>();
		graph.group.mockImplementation(async (_nodeType, _nodeProps, _context, callback) => {
			await callback();
		});

		await new Action({ effects: [effect] }).trigger({ gameGraph: graph, cardId: 'c1' });

		expect(effect.trigger).toHaveBeenCalledWith(graph);
	});

	it('passes a closeWith that discards the active card when it is in hand', async () => {
		const mutableState = mock<MutableGameState>();
		const card = mock<MutableCardState>({ container: { type: 'hand', playerId: 'p1' } });
		mutableState.requireActiveCard.mockReturnValue(card);

		const graph = mock<GameGraph>();
		let capturedCloseWith: ((s: MutableGameState) => void) | undefined;
		graph.group.mockImplementation(async (_nodeType, _nodeProps, context) => {
			capturedCloseWith = context.closeWith;
		});

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'c1' });
		capturedCloseWith!(mutableState);

		expect(card.moveToTopOfDiscardPile).toHaveBeenCalledWith(mutableState);
	});

	it('closeWith does not discard the active card when it is not in hand', async () => {
		const mutableState = mock<MutableGameState>();
		const card = mock<MutableCardState>({ container: { type: 'deck', playerId: 'p1' } });
		mutableState.requireActiveCard.mockReturnValue(card);

		const graph = mock<GameGraph>();
		let capturedCloseWith: ((s: MutableGameState) => void) | undefined;
		graph.group.mockImplementation(async (_nodeType, _nodeProps, context) => {
			capturedCloseWith = context.closeWith;
		});

		await new Action({ effects: [] }).trigger({ gameGraph: graph, cardId: 'c1' });
		capturedCloseWith!(mutableState);

		expect(card.moveToTopOfDiscardPile).not.toHaveBeenCalled();
	});
});
