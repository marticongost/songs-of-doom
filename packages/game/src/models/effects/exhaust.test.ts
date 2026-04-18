import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import type { MutableCardState } from '../game/cardstate';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Target } from '../target';
import { ExhaustEffect, exhaust } from './exhaust';

// ─── ExhaustEffect construction ───────────────────────────────────────────────

describe('ExhaustEffect construction', () => {
	it('exhaust() creates an ExhaustEffect with no target', () => {
		const effect = exhaust();
		expect(effect).toBeInstanceOf(ExhaustEffect);
		expect(effect.target).toBeUndefined();
	});

	it('exhaust({ target }) creates an ExhaustEffect with the given target', () => {
		const target = new Target({});
		const effect = exhaust({ target });
		expect(effect.target).toBeInstanceOf(Target);
	});
});

// ─── ExhaustEffect.apply ────────────────────────────────────────────────────

describe('ExhaustEffect.apply', () => {
	it.each([
		{ label: 'without a target', target: undefined },
		{ label: 'with a target', target: new Target({}) }
	])('exhausts the card and returns its id $label', async ({ target }) => {
		const card = mock<MutableCardState>({ exhausted: false });
		const mutableState = mock<MutableGameState>();
		mutableState.requireCard.calledWith('trt1').mockReturnValue(card);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget
			.calledWith(target, expect.objectContaining({ default: 'active-card' }))
			.mockResolvedValue('trt1');
		let callbackReturn: unknown;
		graph.mutate.mockImplementation((fn) => {
			callbackReturn = fn(mutableState);
			return callbackReturn;
		});

		await exhaust({ target }).apply(graph);

		expect(card.exhausted).toBe(true);
		expect(callbackReturn).toEqual({ card: 'trt1' });
	});

	it('cancels the mutation if the card is already exhausted', async () => {
		const card = mock<MutableCardState>({ exhausted: true });
		const mutableState = mock<MutableGameState>();
		mutableState.requireCard.calledWith('trt1').mockReturnValue(card);
		const graph = mock<GameGraph>();
		graph.requestSingleTarget.mockResolvedValue('trt1');
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await expect(exhaust().apply(graph)).rejects.toThrow();
	});
});
